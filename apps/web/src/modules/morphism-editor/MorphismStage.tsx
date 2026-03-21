import { useEffect, useState, type KeyboardEvent } from "react";
import type { Morphism } from "@morphverse/domain";
import type { WorkspaceMode } from "./workspace";
import { MorphismCard } from "@morphverse/ui";

interface MorphismStageProps {
  canCompose: boolean;
  canSave: boolean;
  canDelete: boolean;
  dirty: boolean;
  morphism: Morphism;
  linkedMorphisms: Morphism[];
  onAddTag: (tag: string) => void;
  onCancel: () => void;
  onChangeField: (field: "title" | "input" | "output" | "content", value: string) => void;
  onDelete: () => void;
  onSelectMorphism: (id: string) => void;
  onOpenRelated: () => void;
  onOpenCompose: () => void;
  onRemoveTag: (tag: string) => void;
  onSave: () => void;
  saving: boolean;
  workspaceMode: WorkspaceMode;
}

export function MorphismStage({
  canCompose,
  canSave,
  canDelete,
  dirty,
  morphism,
  linkedMorphisms,
  onAddTag,
  onCancel,
  onChangeField,
  onDelete,
  onSelectMorphism,
  onOpenRelated,
  onOpenCompose,
  onRemoveTag,
  onSave,
  saving,
  workspaceMode
}: MorphismStageProps) {
  const [tagInput, setTagInput] = useState("");
  const kindLabel = morphism.kind === "composite" ? "复合态射" : "普通态射";
  const isNewDraft = workspaceMode === "new-draft";
  const canEditStandard = morphism.kind === "standard";
  const canCancel = isNewDraft || dirty;

  useEffect(() => {
    setTagInput("");
  }, [morphism.id]);

  function handleTagKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    onAddTag(tagInput);
    setTagInput("");
  }

  return (
    <main className="panel stage-panel">
      <header className="document-toolbar">
        <div>
          <p className="eyebrow">Morphism Note</p>
          <p className="document-meta">
            {isNewDraft ? "未保存草稿 · " : ""}
            {kindLabel}
            {morphism.kind === "composite"
              ? ` · Confidence ${Math.round(morphism.confidenceScore * 100)}%`
              : ""}
          </p>
        </div>
        <div className="stage-actions">
          <span className={dirty || isNewDraft ? "toolbar-state dirty" : "toolbar-state"}>
            {isNewDraft ? "草稿" : dirty ? "未保存" : "已保存"}
          </span>
          <button
            className="secondary-action"
            disabled={!canCancel || saving}
            onClick={onCancel}
            type="button"
          >
            取消
          </button>
          <button
            className="danger-action"
            disabled={!canDelete || saving}
            onClick={onDelete}
            type="button"
          >
            {isNewDraft ? "删除草稿" : "删除"}
          </button>
          <button
            className="primary-action"
            disabled={!canSave}
            onClick={onSave}
            type="button"
          >
            {saving ? "保存中..." : "保存"}
          </button>
          <button
            className="accent-action"
            disabled={!canCompose || saving}
            onClick={onOpenCompose}
            type="button"
          >
            复合 Compose
          </button>
        </div>
      </header>

      <section className="document-header">
        <label className="title-editor">
          <span className="eyebrow">Title</span>
          <input
            className="document-title-input"
            onChange={(event) => onChangeField("title", event.target.value)}
            type="text"
            value={morphism.title}
          />
        </label>
        <div className="title-strip">
          <span className="pill pill-primary">{kindLabel}</span>
          {morphism.kind === "composite" ? (
            <span className="pill">Confidence {Math.round(morphism.confidenceScore * 100)}%</span>
          ) : null}
        </div>
      </section>

      <section className="document-section">
        <div className="property-list">
          <div className="property-row">
            <div className="property-label">Input</div>
            <div className="property-value">
              {canEditStandard ? (
                <textarea
                  className="field-textarea"
                  onChange={(event) => onChangeField("input", event.target.value)}
                  rows={3}
                  value={morphism.input}
                />
              ) : (
                <p className="lead-copy">{morphism.input}</p>
              )}
            </div>
          </div>
          <div className="property-row">
            <div className="property-label">Output</div>
            <div className="property-value">
              {canEditStandard ? (
                <textarea
                  className="field-textarea"
                  onChange={(event) => onChangeField("output", event.target.value)}
                  rows={3}
                  value={morphism.output}
                />
              ) : (
                <p className="lead-copy">{morphism.output}</p>
              )}
            </div>
          </div>
          <div className="property-row">
            <div className="property-label">Tags</div>
            <div className="property-inline">
              <div className="tag-editor">
                {morphism.tags.map((tag) =>
                  canEditStandard ? (
                    <button
                      key={tag}
                      className="tag-chip"
                      onClick={() => onRemoveTag(tag)}
                      type="button"
                    >
                      #{tag}
                      <span>×</span>
                    </button>
                  ) : (
                    <span key={tag} className="tag-pill">
                      #{tag}
                    </span>
                  )
                )}
                {canEditStandard ? (
                  <input
                    className="tag-input"
                    onChange={(event) => setTagInput(event.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="输入标签后回车"
                    type="text"
                    value={tagInput}
                  />
                ) : null}
              </div>
            </div>
          </div>
          {morphism.kind === "composite" ? (
            <>
              <div className="property-row">
                <div className="property-label">AI Insight</div>
                <div className="property-value">
                  <p>{morphism.aiInsight}</p>
                </div>
              </div>
              <div className="property-row">
                <div className="property-label">Sources</div>
                <div className="property-inline property-reference">
                  <span>{morphism.sourceMorphismId}</span>
                  <span>{morphism.targetMorphismId}</span>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </section>

      <section className="document-section">
        <div className="section-header">
          <h2>Content</h2>
          <span className="eyebrow">Note</span>
        </div>
        <div className="document-body">
          <textarea
            className="content-textarea"
            onChange={(event) => onChangeField("content", event.target.value)}
            placeholder="在这里继续扩展你的态射内容..."
            rows={10}
            value={morphism.content ?? ""}
          />
        </div>
      </section>

      <section className="document-section">
        <div className="section-header">
          <h2>Connections</h2>
          <button
            className="secondary-action"
            disabled={!canCompose || saving}
            onClick={onOpenRelated}
            type="button"
          >
            创建新连接
          </button>
        </div>
        <div className="document-links">
          {linkedMorphisms.map((connection) => (
            <MorphismCard
              key={connection.id}
              badge={connection.kind === "composite" ? "Composite" : "Linked"}
              density="compact"
              hint={connection.tags.slice(0, 2).join(" · ") || "点击跳转"}
              morphism={connection}
              summary={connection.output}
              onClick={() => onSelectMorphism(connection.id)}
            />
          ))}
          {linkedMorphisms.length === 0 ? (
            <div className="empty-card">
              <p className="eyebrow">No links yet</p>
              <p>从右侧 Copilot 寻找一个语义兄弟，把这条态射接入你的知识网络。</p>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
