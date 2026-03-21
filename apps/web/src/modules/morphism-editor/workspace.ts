import type { CompositeMorphism, Morphism, MorphismConnection, StandardMorphism } from "@morphverse/domain";

export type WorkspaceMode = "existing" | "new-draft";

export interface WorkspaceDraft {
  id: string;
  kind: "standard" | "composite";
  title: string;
  input: string;
  output: string;
  tags: string[];
  content: string;
  connections: MorphismConnection[];
  sourceMorphismId?: string;
  targetMorphismId?: string;
  confidenceScore?: number;
  aiInsight?: string;
}

export function toWorkspaceDraft(morphism: Morphism): WorkspaceDraft {
  if (morphism.kind === "composite") {
    return {
      id: morphism.id,
      kind: morphism.kind,
      title: morphism.title,
      input: morphism.input,
      output: morphism.output,
      tags: morphism.tags,
      content: morphism.content ?? "",
      connections: morphism.connections,
      sourceMorphismId: morphism.sourceMorphismId,
      targetMorphismId: morphism.targetMorphismId,
      confidenceScore: morphism.confidenceScore,
      aiInsight: morphism.aiInsight
    };
  }

  return {
    id: morphism.id,
    kind: morphism.kind,
    title: morphism.title,
    input: morphism.input,
    output: morphism.output,
    tags: morphism.tags,
    content: morphism.content ?? "",
    connections: morphism.connections
  };
}

export function createNewStandardDraft(): WorkspaceDraft {
  return {
    id: `draft-${Date.now()}`,
    kind: "standard",
    title: "Untitled Morphism",
    input: "",
    output: "",
    tags: [],
    content: "",
    connections: []
  };
}

export function workspaceDraftToMorphism(draft: WorkspaceDraft): Morphism {
  if (draft.kind === "composite") {
    return {
      id: draft.id,
      kind: "composite",
      title: draft.title,
      input: draft.input,
      output: draft.output,
      tags: draft.tags,
      content: draft.content,
      connections: draft.connections,
      sourceMorphismId: draft.sourceMorphismId ?? "",
      targetMorphismId: draft.targetMorphismId ?? "",
      confidenceScore: draft.confidenceScore ?? 0,
      aiInsight: draft.aiInsight ?? ""
    } satisfies CompositeMorphism;
  }

  return {
    id: draft.id,
    kind: "standard",
    title: draft.title,
    input: draft.input,
    output: draft.output,
    tags: draft.tags,
    content: draft.content,
    connections: draft.connections
  } satisfies StandardMorphism;
}

export function areDraftsEqual(left: WorkspaceDraft | null, right: WorkspaceDraft | null) {
  if (!left || !right) {
    return left === right;
  }

  return JSON.stringify(normalizeDraft(left)) === JSON.stringify(normalizeDraft(right));
}

export function isDraftValid(draft: WorkspaceDraft | null) {
  if (!draft) {
    return false;
  }

  if (draft.kind === "composite") {
    return Boolean(draft.title.trim());
  }

  return Boolean(draft.title.trim() && draft.input.trim() && draft.output.trim());
}

export function toCreatePayload(draft: WorkspaceDraft) {
  return {
    title: draft.title.trim(),
    input: draft.input.trim(),
    output: draft.output.trim(),
    tags: normalizeTags(draft.tags),
    content: draft.content.trim() || undefined
  };
}

export function toUpdatePayload(draft: WorkspaceDraft) {
  return toCreatePayload(draft);
}

export function toCompositeUpdatePayload(draft: WorkspaceDraft) {
  return {
    title: draft.title.trim(),
    content: draft.content.trim() || undefined
  };
}

export function addTagToDraft(draft: WorkspaceDraft, tag: string) {
  const normalized = tag.trim().replace(/^#/, "");
  if (!normalized) {
    return draft;
  }

  return {
    ...draft,
    tags: normalizeTags([...draft.tags, normalized])
  };
}

export function removeTagFromDraft(draft: WorkspaceDraft, tag: string) {
  return {
    ...draft,
    tags: draft.tags.filter((item) => item !== tag)
  };
}

function normalizeDraft(draft: WorkspaceDraft) {
  return {
    ...draft,
    title: draft.title.trim(),
    input: draft.input.trim(),
    output: draft.output.trim(),
    content: draft.content.trim(),
    tags: normalizeTags(draft.tags)
  };
}

function normalizeTags(tags: string[]) {
  return [...new Set(tags.map((item) => item.trim().replace(/^#/, "")).filter(Boolean))];
}
