import type { Morphism } from "@morphverse/domain";
import { MorphismCard } from "@morphverse/ui";

interface MorphismStageProps {
  morphism: Morphism;
  linkedMorphisms: Morphism[];
  onSelectMorphism: (id: string) => void;
  onOpenRelated: () => void;
  onOpenCompose: () => void;
}

export function MorphismStage({
  morphism,
  linkedMorphisms,
  onSelectMorphism,
  onOpenRelated,
  onOpenCompose
}: MorphismStageProps) {
  const kindLabel = morphism.kind === "composite" ? "复合态射" : "普通态射";

  return (
    <main className="panel stage-panel">
      <header className="document-toolbar">
        <div>
          <p className="eyebrow">Morphism Note</p>
          <p className="document-meta">
            {kindLabel}
            {morphism.kind === "composite"
              ? ` · Confidence ${Math.round(morphism.confidenceScore * 100)}%`
              : ""}
          </p>
        </div>
        <div className="stage-actions">
          <button
            className="accent-action"
            disabled={morphism.kind !== "standard"}
            onClick={onOpenCompose}
            type="button"
          >
            复合 Compose
          </button>
        </div>
      </header>

      <section className="document-header">
        <h1>{morphism.title}</h1>
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
              <p className="lead-copy">{morphism.input}</p>
            </div>
          </div>
          <div className="property-row">
            <div className="property-label">Output</div>
            <div className="property-value">
              <p className="lead-copy">{morphism.output}</p>
            </div>
          </div>
          <div className="property-row">
            <div className="property-label">Tags</div>
            <div className="property-inline">
              {morphism.tags.map((tag) => (
                <span key={tag} className="tag-pill">
                  #{tag}
                </span>
              ))}
              {morphism.kind === "standard" ? <button className="tag-action">添加标签</button> : null}
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
          <p>{morphism.content ?? "这一条态射还没有更长的 Markdown 内容。"}</p>
        </div>
      </section>

      <section className="document-section">
        <div className="section-header">
          <h2>Connections</h2>
          <button
            className="secondary-action"
            disabled={morphism.kind !== "standard"}
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
