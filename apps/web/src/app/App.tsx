import { useState } from "react";
import { createCompositeMorphism, type Morphism, type StandardMorphism } from "@morphverse/domain";
import { listMockMorphisms } from "../mocks/morphisms";
import { MorphismListPanel } from "../modules/morphism-list/MorphismListPanel";
import { MorphismStage } from "../modules/morphism-editor/MorphismStage";
import { CopilotDrawer } from "../modules/shared-state/CopilotDrawer";
import { createInitialUiState, type CopilotContext } from "../modules/shared-state/state";

export function App() {
  const [morphisms, setMorphisms] = useState(listMockMorphisms());
  const [selectedId, setSelectedId] = useState(morphisms[0]?.id ?? "");
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(true);
  const [copilot, setCopilot] = useState(createInitialUiState());

  const selected = morphisms.find((item) => item.id === selectedId) ?? morphisms[0];
  const linkedMorphisms = selected
    ? selected.connections
        .map((connection) => morphisms.find((item) => item.id === connection.targetMorphismId))
        .filter((item): item is Morphism => Boolean(item))
    : [];

  function openCopilot(context: CopilotContext) {
    setCopilot({
      drawerOpen: true,
      copilotMode: context.mode,
      copilotContext: context
    });
  }

  function updateSelectedMorphism(updater: (current: StandardMorphism) => StandardMorphism) {
    setMorphisms((current) =>
      current.map((item) => {
        if (item.id !== selectedId || item.kind !== "standard") {
          return item;
        }
        return updater(item);
      })
    );
  }

  function handleSelectCandidate(targetId: string) {
    if (!selected || selected.kind !== "standard" || !copilot.copilotMode) {
      return;
    }

    if (copilot.copilotMode === "related") {
      updateSelectedMorphism((current) => ({
        ...current,
        connections: current.connections.some((item) => item.targetMorphismId === targetId)
          ? current.connections
          : [...current.connections, { targetMorphismId: targetId, kind: "manual" }]
      }));
      setCopilot(createInitialUiState());
      return;
    }

    const target = morphisms.find(
      (item): item is StandardMorphism => item.id === targetId && item.kind === "standard"
    );

    if (!target) {
      return;
    }

    const composite = createCompositeMorphism({
      id: `composite-${Date.now()}`,
      title: `${selected.title} ∘ ${target.title}`,
      input: selected.input,
      output: target.output,
      tags: [...new Set([...selected.tags, ...target.tags, "composite"])],
      content: `由 "${selected.output}" 接驳 "${target.input}" 生成的复合态射。`,
      sourceMorphismId: selected.id,
      targetMorphismId: target.id,
      confidenceScore: 0.89,
      aiInsight: `"${selected.output}" 为 "${target.input}" 提供了天然的认知跳板，两者组合后形成一条更完整的行动链路。`
    });

    setMorphisms((current) => [composite, ...current]);
    setSelectedId(composite.id);
    setCopilot(createInitialUiState());
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
        items={morphisms}
        open={leftDrawerOpen}
        onClose={() => setLeftDrawerOpen(false)}
        selectedId={selectedId}
        onSelect={(id) => {
          setSelectedId(id);
          setLeftDrawerOpen(false);
        }}
      />
      {selected ? (
        <div className="workspace">
          <MorphismStage
            linkedMorphisms={linkedMorphisms}
            morphism={selected}
            onOpenRelated={() => openCopilot({ mode: "related", morphismId: selected.id })}
            onOpenCompose={() => openCopilot({ mode: "compose", morphismId: selected.id })}
            onSelectMorphism={setSelectedId}
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
