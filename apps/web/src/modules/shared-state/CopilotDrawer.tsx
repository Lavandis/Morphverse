import { useMemo, useState } from "react";
import type { Morphism, StandardMorphism } from "@morphverse/domain";
import { Drawer, MorphismCard } from "@morphverse/ui";
import type { UiState } from "./state";

interface CopilotDrawerProps {
  morphisms: Morphism[];
  state: UiState;
  onSelectCandidate: (id: string) => void;
  onClose: () => void;
}

function scoreByOverlap(base: string, candidate: string) {
  const baseTokens = new Set(base.toLowerCase().split(/\W+/).filter(Boolean));
  const candidateTokens = new Set(candidate.toLowerCase().split(/\W+/).filter(Boolean));
  const overlap = [...baseTokens].filter((token) => candidateTokens.has(token)).length;
  return Math.min(0.98, 0.42 + overlap * 0.14);
}

export function CopilotDrawer({
  morphisms,
  state,
  onSelectCandidate,
  onClose
}: CopilotDrawerProps) {
  const [query, setQuery] = useState("");
  const active = morphisms.find((item) => item.id === state.copilotContext?.morphismId);
  const standards = morphisms.filter((item): item is StandardMorphism => item.kind === "standard");
  const title = state.copilotMode === "compose" ? "寻找复合" : "寻找关联";
  const description =
    state.copilotMode === "compose"
      ? "按当前输出查找可衔接的输入。"
      : "围绕当前态射筛选相近条目。";

  const candidates = useMemo(() => {
    if (!active || active.kind !== "standard") {
      return [];
    }

    const next = standards
      .filter((item) => item.id !== active.id)
      .filter((item) =>
        state.copilotMode === "related" && query.trim()
          ? `${item.title} ${item.input} ${item.output} ${item.tags.join(" ")}`
              .toLowerCase()
              .includes(query.trim().toLowerCase())
          : true
      )
      .map((item) => ({
        morphism: item,
        score:
          state.copilotMode === "compose"
            ? scoreByOverlap(active.output, item.input)
            : scoreByOverlap(`${active.input} ${active.output}`, `${item.input} ${item.output}`)
      }))
      .sort((left, right) => right.score - left.score);

    return next;
  }, [active, query, standards, state.copilotMode]);

  return (
    <Drawer
      eyebrow="Inspector"
      open={state.drawerOpen}
      side="right"
      title={title}
      description={active ? `${description} 当前：${active.title}` : "等待态射上下文"}
      onClose={onClose}
    >
      {active ? (
        <div className="inspector-context">
          <p className="eyebrow">当前态射</p>
          <strong>{active.title}</strong>
          <p>{state.copilotMode === "compose" ? active.output : active.input}</p>
        </div>
      ) : null}
      {state.copilotMode === "related" ? (
        <label className="search-shell">
          <span className="eyebrow">Filter</span>
          <input
            className="search-input"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="过滤标题、输出或标签"
            type="text"
            value={query}
          />
        </label>
      ) : null}
      <div className="candidate-stack">
        {candidates.map(({ morphism, score }) => (
          <MorphismCard
            key={morphism.id}
            badge={state.copilotMode === "compose" ? "Compose" : "Related"}
            density="compact"
            hint={`匹配 ${Math.round(score * 100)}%`}
            morphism={morphism}
            summary={state.copilotMode === "compose" ? morphism.input : morphism.output}
            onClick={() => onSelectCandidate(morphism.id)}
          />
        ))}
        {candidates.length === 0 ? (
          <div className="empty-card">
            <p className="eyebrow">No candidates</p>
            <p>换一个查询词，或者先创建更多态射，让 AI 有更多可以碰撞的语义材料。</p>
          </div>
        ) : null}
      </div>
    </Drawer>
  );
}
