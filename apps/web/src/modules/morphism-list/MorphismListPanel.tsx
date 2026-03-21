import type { Morphism } from "@morphverse/domain";

interface MorphismListPanelProps {
  items: Morphism[];
  selectedId: string;
  open: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
}

export function MorphismListPanel({
  items,
  selectedId,
  open,
  onClose,
  onSelect
}: MorphismListPanelProps) {
  return (
    <aside className={open ? "panel left-panel open" : "panel left-panel"}>
      <div className="left-panel-header">
        <div>
          <p className="eyebrow">Library</p>
          <h2>最近态射</h2>
        </div>
        <button className="ghost-icon" onClick={onClose} type="button">
          ×
        </button>
      </div>
      <button className="primary-action">新建</button>
      <div className="drawer-meta">
        <span>{items.length} 条记录</span>
      </div>
      <div className="list-stack">
        {items.map((item) => (
          <button
            key={item.id}
            className={item.id === selectedId ? "list-card active" : "list-card"}
            onClick={() => onSelect(item.id)}
            type="button"
          >
            <div className="list-card-topline">
              <strong>{item.title}</strong>
              <span className="list-card-kind">{item.kind === "composite" ? "复合" : "普通"}</span>
            </div>
            <span className="list-card-copy">{item.output}</span>
            <span className="list-card-tags">
              {item.tags.slice(0, 3).join(" · ") || "未添加标签"}
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}
