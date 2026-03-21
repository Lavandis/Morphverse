import { useEffect, useMemo, useState } from "react";
import type { ComposeCandidate, Morphism, RelatedCandidate, StandardMorphism } from "@morphverse/domain";
import { Drawer, MorphismCard } from "@morphverse/ui";
import type { UiState } from "./state";
import { morphismApi } from "../../shared/lib/api";

interface CopilotDrawerProps {
  morphisms: Morphism[];
  state: UiState;
  onSelectCandidate: (id: string) => void;
  onClose: () => void;
}

export function CopilotDrawer({
  morphisms,
  state,
  onSelectCandidate,
  onClose
}: CopilotDrawerProps) {
  const [query, setQuery] = useState("");
  const [candidates, setCandidates] = useState<(RelatedCandidate | ComposeCandidate)[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const active = morphisms.find((item) => item.id === state.copilotContext?.morphismId);
  const title = state.copilotMode === "compose" ? "寻找复合" : "寻找关联";
  const description =
    state.copilotMode === "compose"
      ? "按当前输出查找可衔接的输入。"
      : "围绕当前态射筛选相近条目。";

  useEffect(() => {
    if (!state.drawerOpen || !active || active.kind !== "standard" || !state.copilotMode) {
      setCandidates([]);
      setLoading(false);
      setErrorMessage(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setErrorMessage(null);

    const request =
      state.copilotMode === "compose"
        ? morphismApi.getComposeCandidates(active.id)
        : morphismApi.getRelatedCandidates(active.id);

    void request
      .then((result) => {
        if (cancelled) {
          return;
        }
        setCandidates(result);
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }
        setErrorMessage(error instanceof Error ? error.message : "加载候选失败。");
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [active, state.copilotMode, state.drawerOpen]);

  const visibleCandidates = useMemo(() => {
    if (state.copilotMode !== "related" || !query.trim()) {
      return candidates;
    }

    const normalizedQuery = query.trim().toLowerCase();
    return candidates.filter(({ morphism }) =>
      `${morphism.title} ${morphism.input} ${morphism.output} ${morphism.tags.join(" ")}`
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [candidates, query, state.copilotMode]);

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
        {loading ? (
          <div className="empty-card">
            <p className="eyebrow">Loading</p>
            <p>正在获取候选态射。</p>
          </div>
        ) : null}
        {errorMessage ? (
          <div className="empty-card">
            <p className="eyebrow">Unavailable</p>
            <p>{errorMessage}</p>
          </div>
        ) : null}
        {visibleCandidates.map(({ morphism, score }) => (
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
        {!loading && !errorMessage && visibleCandidates.length === 0 ? (
          <div className="empty-card">
            <p className="eyebrow">No candidates</p>
            <p>换一个查询词，或者先创建更多态射，让 AI 有更多可以碰撞的语义材料。</p>
          </div>
        ) : null}
      </div>
    </Drawer>
  );
}
