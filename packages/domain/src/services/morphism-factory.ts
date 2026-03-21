import type {
  CompositeMorphism,
  MorphismConnection,
  StandardMorphism
} from "../types/morphism";

interface StandardInput {
  id: string;
  title: string;
  input: string;
  output: string;
  tags?: string[];
  content?: string;
  connections?: MorphismConnection[];
}

interface CompositeInput {
  id: string;
  title: string;
  input: string;
  output: string;
  tags?: string[];
  content?: string;
  sourceMorphismId: string;
  targetMorphismId: string;
  confidenceScore: number;
  aiInsight: string;
}

function normalizeTags(tags?: string[]) {
  return [...new Set((tags ?? []).map((item) => item.trim()).filter(Boolean))];
}

export function createStandardMorphism(input: StandardInput): StandardMorphism {
  return {
    id: input.id,
    kind: "standard",
    title: input.title.trim(),
    input: input.input.trim(),
    output: input.output.trim(),
    tags: normalizeTags(input.tags),
    content: input.content?.trim(),
    connections: input.connections ?? []
  };
}

export function createCompositeMorphism(input: CompositeInput): CompositeMorphism {
  if (input.confidenceScore < 0 || input.confidenceScore > 1) {
    throw new Error("Confidence score must be between 0 and 1.");
  }

  return {
    id: input.id,
    kind: "composite",
    title: input.title.trim(),
    input: input.input.trim(),
    output: input.output.trim(),
    tags: normalizeTags(input.tags),
    content: input.content?.trim(),
    connections: [],
    sourceMorphismId: input.sourceMorphismId,
    targetMorphismId: input.targetMorphismId,
    confidenceScore: input.confidenceScore,
    aiInsight: input.aiInsight.trim()
  };
}
