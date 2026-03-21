import { useEffect, useState } from "react";
import type { Morphism } from "@morphverse/domain";
import { listMockMorphisms } from "../mocks/morphisms";
import { MorphismListPanel } from "../modules/morphism-list/MorphismListPanel";
import { MorphismStage } from "../modules/morphism-editor/MorphismStage";
import {
  addTagToDraft,
  areDraftsEqual,
  createNewStandardDraft,
  isDraftValid,
  removeTagFromDraft,
  toCompositeUpdatePayload,
  toCreatePayload,
  toUpdatePayload,
  toWorkspaceDraft,
  workspaceDraftToMorphism,
  type WorkspaceDraft,
  type WorkspaceMode
} from "../modules/morphism-editor/workspace";
import { CopilotDrawer } from "../modules/shared-state/CopilotDrawer";
import { createInitialUiState, type CopilotContext } from "../modules/shared-state/state";
import { morphismApi } from "../shared/lib/api";

const fallbackMorphisms = listMockMorphisms();

export function App() {
  const [morphisms, setMorphisms] = useState<Morphism[]>(fallbackMorphisms);
  const [selectedId, setSelectedId] = useState(fallbackMorphisms[0]?.id ?? "");
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>("existing");
  const [draftValues, setDraftValues] = useState<WorkspaceDraft | null>(
    fallbackMorphisms[0] ? toWorkspaceDraft(fallbackMorphisms[0]) : null
  );
  const [lastCommittedSnapshot, setLastCommittedSnapshot] = useState<WorkspaceDraft | null>(
    fallbackMorphisms[0] ? toWorkspaceDraft(fallbackMorphisms[0]) : null
  );
  const [previousSelectedId, setPreviousSelectedId] = useState<string | null>(null);
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(true);
  const [copilot, setCopilot] = useState(createInitialUiState());
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void morphismApi
      .list()
      .then((items) => {
        if (cancelled || items.length === 0) {
          return;
        }

        const nextSelected = items.find((item) => item.id === selectedId) ?? items[0];
        const nextDraft = toWorkspaceDraft(nextSelected);

        setMorphisms(items);
        setSelectedId(nextSelected.id);
        setWorkspaceMode("existing");
        setDraftValues(nextDraft);
        setLastCommittedSnapshot(nextDraft);
        setPreviousSelectedId(null);
      })
      .catch(() => {
        // Keep the local fallback data if the API is not available.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setDirty(!areDraftsEqual(draftValues, lastCommittedSnapshot));
  }, [draftValues, lastCommittedSnapshot]);

  useEffect(() => {
    if (!copilot.drawerOpen || !dirty) {
      return;
    }

    setCopilot(createInitialUiState());
  }, [copilot.drawerOpen, dirty]);

  const currentMorphism = draftValues ? workspaceDraftToMorphism(draftValues) : morphisms[0] ?? null;
  const displayedMorphisms =
    workspaceMode === "new-draft" && currentMorphism ? [currentMorphism, ...morphisms] : morphisms;
  const linkedMorphisms = currentMorphism
    ? currentMorphism.connections
        .map((connection) => morphisms.find((item) => item.id === connection.targetMorphismId))
        .filter((item): item is Morphism => Boolean(item))
    : [];
  const canUseCopilot =
    workspaceMode === "existing" && currentMorphism?.kind === "standard" && !dirty && !saving;
  const canSave =
    !saving &&
    isDraftValid(draftValues) &&
    Boolean(draftValues) &&
    (workspaceMode === "new-draft" || dirty);
  const canDelete = Boolean(currentMorphism) && !saving;

  function openCopilot(context: CopilotContext) {
    setCopilot({
      drawerOpen: true,
      copilotMode: context.mode,
      copilotContext: context
    });
  }

  function selectMorphism(id: string) {
    const next = morphisms.find((item) => item.id === id);
    if (!next) {
      return;
    }

    if (dirty && !window.confirm("放弃当前未保存更改并继续？")) {
      return;
    }

    const nextDraft = toWorkspaceDraft(next);
    setSelectedId(id);
    setWorkspaceMode("existing");
    setDraftValues(nextDraft);
    setLastCommittedSnapshot(nextDraft);
    setPreviousSelectedId(null);
    setLeftDrawerOpen(false);
  }

  function handleCreateNew() {
    if (dirty && !window.confirm("放弃当前未保存更改并继续？")) {
      return;
    }

    const nextDraft = createNewStandardDraft();
    const fallbackSelection =
      workspaceMode === "new-draft"
        ? (previousSelectedId ?? morphisms[0]?.id ?? null)
        : (selectedId || morphisms[0]?.id || null);

    setPreviousSelectedId(fallbackSelection);
    setSelectedId(nextDraft.id);
    setWorkspaceMode("new-draft");
    setDraftValues(nextDraft);
    setLastCommittedSnapshot(nextDraft);
    setLeftDrawerOpen(false);
  }

  function handleDraftChange(field: "title" | "input" | "output" | "content", value: string) {
    setDraftValues((current) => (current ? { ...current, [field]: value } : current));
  }

  function handleAddTag(tag: string) {
    setDraftValues((current) => (current ? addTagToDraft(current, tag) : current));
  }

  function handleRemoveTag(tag: string) {
    setDraftValues((current) => (current ? removeTagFromDraft(current, tag) : current));
  }

  function commitSelectedMorphism(next: Morphism) {
    const nextDraft = toWorkspaceDraft(next);
    setSelectedId(next.id);
    setWorkspaceMode("existing");
    setDraftValues(nextDraft);
    setLastCommittedSnapshot(nextDraft);
    setPreviousSelectedId(null);
  }

  function handleCancel() {
    if (workspaceMode === "new-draft") {
      const fallbackId =
        (previousSelectedId && morphisms.some((item) => item.id === previousSelectedId)
          ? previousSelectedId
          : morphisms[0]?.id) ?? "";
      const fallback = morphisms.find((item) => item.id === fallbackId) ?? morphisms[0] ?? null;

      setWorkspaceMode("existing");
      setPreviousSelectedId(null);
      setSelectedId(fallback?.id ?? "");
      setDraftValues(fallback ? toWorkspaceDraft(fallback) : null);
      setLastCommittedSnapshot(fallback ? toWorkspaceDraft(fallback) : null);
      return;
    }

    if (lastCommittedSnapshot) {
      setDraftValues(lastCommittedSnapshot);
    }
  }

  function resetWorkspace(nextItems: Morphism[], preferredId?: string) {
    if (nextItems.length === 0) {
      setMorphisms([]);
      setSelectedId("");
      setWorkspaceMode("existing");
      setDraftValues(null);
      setLastCommittedSnapshot(null);
      setPreviousSelectedId(null);
      setCopilot(createInitialUiState());
      return;
    }

    const nextSelected = nextItems.find((item) => item.id === preferredId) ?? nextItems[0];
    const nextDraft = toWorkspaceDraft(nextSelected);

    setMorphisms(nextItems);
    setSelectedId(nextSelected.id);
    setWorkspaceMode("existing");
    setDraftValues(nextDraft);
    setLastCommittedSnapshot(nextDraft);
    setPreviousSelectedId(null);
    setCopilot(createInitialUiState());
  }

  async function reloadAfterDelete(deletedId: string) {
    const nextItems = await morphismApi.list();
    const preferredId =
      morphisms
        .filter((item) => item.id !== deletedId)
        .map((item) => item.id)
        .find((id) => nextItems.some((item) => item.id === id)) ?? nextItems[0]?.id;

    resetWorkspace(nextItems, preferredId);
  }

  async function handleDelete() {
    if (!currentMorphism) {
      return;
    }

    if (workspaceMode === "new-draft") {
      if (!window.confirm("删除这条未保存草稿？")) {
        return;
      }

      handleCancel();
      return;
    }

    const confirmed =
      currentMorphism.kind === "standard"
        ? window.confirm("删除当前态射？相关连接和依赖它的复合态射也会一并移除。")
        : window.confirm("删除当前复合态射？");

    if (!confirmed) {
      return;
    }

    setSaving(true);

    try {
      if (currentMorphism.kind === "standard") {
        await morphismApi.deleteMorphism(currentMorphism.id);
      } else {
        await morphismApi.deleteComposite(currentMorphism.id);
      }

      await reloadAfterDelete(currentMorphism.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : "删除失败。";
      window.alert(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSave() {
    if (!draftValues || !canSave) {
      return;
    }

    setSaving(true);

    try {
      if (workspaceMode === "new-draft") {
        const created = await morphismApi.create(toCreatePayload(draftValues));
        setMorphisms((current) => [created, ...current]);
        commitSelectedMorphism(created);
        return;
      }

      if (draftValues.kind === "standard") {
        const updated = await morphismApi.update(draftValues.id, toUpdatePayload(draftValues));
        setMorphisms((current) => current.map((item) => (item.id === updated.id ? updated : item)));
        commitSelectedMorphism(updated);
        return;
      }

      const updatedComposite = await morphismApi.updateComposite(
        draftValues.id,
        toCompositeUpdatePayload(draftValues)
      );
      setMorphisms((current) =>
        current.map((item) => (item.id === updatedComposite.id ? updatedComposite : item))
      );
      commitSelectedMorphism(updatedComposite);
    } catch (error) {
      const message = error instanceof Error ? error.message : "保存失败。";
      window.alert(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSelectCandidate(targetId: string) {
    if (!currentMorphism || currentMorphism.kind !== "standard" || !copilot.copilotMode) {
      return;
    }

    if (dirty && !window.confirm("放弃当前未保存更改并继续？")) {
      return;
    }

    if (copilot.copilotMode === "related") {
      try {
        const updated = await morphismApi.addConnection(currentMorphism.id, targetId);
        setMorphisms((current) => current.map((item) => (item.id === updated.id ? updated : item)));
        commitSelectedMorphism(updated);
        setCopilot(createInitialUiState());
      } catch (error) {
        const message = error instanceof Error ? error.message : "创建连接失败。";
        window.alert(message);
      }
      return;
    }

    try {
      const composite = await morphismApi.createComposite(currentMorphism.id, targetId);
      setMorphisms((current) => [composite, ...current]);
      commitSelectedMorphism(composite);
      setCopilot(createInitialUiState());
    } catch (error) {
      const message = error instanceof Error ? error.message : "生成复合态射失败。";
      window.alert(message);
    }
  }

  const shellClass = [
    "shell",
    leftDrawerOpen ? "shell-left-open" : "",
    copilot.drawerOpen ? "shell-right-open" : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={shellClass}>
      <button
        aria-label="Open navigation"
        className="floating-toggle"
        onClick={() => setLeftDrawerOpen((current) => !current)}
        type="button"
      >
        ☰
      </button>
      <div className="brand-mark">
        <strong>Morphverse</strong>
      </div>
      <MorphismListPanel
        draftId={workspaceMode === "new-draft" && draftValues ? draftValues.id : undefined}
        items={displayedMorphisms}
        onCreate={handleCreateNew}
        open={leftDrawerOpen}
        onClose={() => setLeftDrawerOpen(false)}
        selectedId={selectedId}
        onSelect={selectMorphism}
      />
      {currentMorphism ? (
        <div className="workspace">
          <MorphismStage
            canCompose={canUseCopilot}
            canDelete={canDelete}
            canSave={canSave}
            dirty={dirty}
            linkedMorphisms={linkedMorphisms}
            morphism={currentMorphism}
            onAddTag={handleAddTag}
            onCancel={handleCancel}
            onChangeField={handleDraftChange}
            onDelete={handleDelete}
            onOpenRelated={() =>
              canUseCopilot ? openCopilot({ mode: "related", morphismId: currentMorphism.id }) : undefined
            }
            onOpenCompose={() =>
              canUseCopilot ? openCopilot({ mode: "compose", morphismId: currentMorphism.id }) : undefined
            }
            onRemoveTag={handleRemoveTag}
            onSave={handleSave}
            onSelectMorphism={selectMorphism}
            saving={saving}
            workspaceMode={workspaceMode}
          />
        </div>
      ) : null}
      <CopilotDrawer
        morphisms={morphisms}
        onSelectCandidate={handleSelectCandidate}
        state={copilot}
        onClose={() => setCopilot(createInitialUiState())}
      />
      {copilot.drawerOpen ? (
        <button
          aria-label="Close AI drawer"
          className="overlay-scrim"
          onClick={() => setCopilot(createInitialUiState())}
          type="button"
        />
      ) : null}
    </div>
  );
}
