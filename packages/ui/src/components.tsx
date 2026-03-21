import type { PropsWithChildren } from "react";
import type { Morphism } from "@morphverse/domain";

interface DrawerProps extends PropsWithChildren {
  open: boolean;
  title: string;
  description?: string;
  eyebrow?: string;
  side?: "left" | "right";
  onClose: () => void;
}

interface MorphismCardProps {
  morphism: Morphism;
  badge?: string;
  hint?: string;
  summary?: string;
  density?: "default" | "compact";
  onClick?: () => void;
}

export function Drawer({
  open,
  title,
  description,
  eyebrow = "Panel",
  side = "right",
  onClose,
  children
}: DrawerProps) {
  return (
    <aside className={open ? `panel drawer drawer-${side} open` : `panel drawer drawer-${side}`}>
      <div className="drawer-header">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          {description ? <p className="drawer-description">{description}</p> : null}
        </div>
        <button className="drawer-close" onClick={onClose} type="button">
          关闭
        </button>
      </div>
      <div className="drawer-body">{children}</div>
    </aside>
  );
}

export function MorphismCard({
  morphism,
  badge,
  hint,
  summary,
  density = "default",
  onClick
}: MorphismCardProps) {
  const className =
    morphism.kind === "composite"
      ? `ui-card ui-card-${density} composite`
      : `ui-card ui-card-${density}`;

  if (onClick) {
    return (
      <button className={`${className} ui-card-button`} onClick={onClick} type="button">
        <CardContent density={density} hint={hint} morphism={morphism} badge={badge} summary={summary} />
      </button>
    );
  }

  return (
    <article className={className}>
      <CardContent density={density} hint={hint} morphism={morphism} badge={badge} summary={summary} />
    </article>
  );
}

function CardContent({
  density,
  morphism,
  badge,
  hint,
  summary
}: Pick<MorphismCardProps, "density" | "morphism" | "badge" | "hint" | "summary">) {
  const fallbackHint =
    hint ?? (morphism.kind === "composite" ? `Confidence ${Math.round(morphism.confidenceScore * 100)}%` : undefined);

  if (density === "compact") {
    return (
      <>
        <div className="ui-card-topline">
          <strong>{morphism.title}</strong>
          {badge ? <span className="ui-card-badge">{badge}</span> : null}
        </div>
        <p className="ui-card-summary">{summary ?? morphism.output}</p>
        {fallbackHint ? <p className="ui-card-hint">{fallbackHint}</p> : null}
      </>
    );
  }

  return (
    <>
      <div className="ui-card-topline">
        <strong>{morphism.title}</strong>
        {badge ? <span className="ui-card-badge">{badge}</span> : null}
      </div>
      <p className="ui-card-input">{morphism.input}</p>
      <p className="ui-card-output">{morphism.output}</p>
      {fallbackHint ? <p className="ui-card-hint">{fallbackHint}</p> : null}
    </>
  );
}
