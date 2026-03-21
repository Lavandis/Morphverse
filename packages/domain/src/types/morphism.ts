export type CopilotMode = "related" | "compose";
export type MorphismKind = "standard" | "composite";

export interface MorphismConnection {
  targetMorphismId: string;
  kind: "manual" | "composite";
}

export interface BaseMorphism {
  id: string;
  kind: MorphismKind;
  title: string;
  input: string;
  output: string;
  tags: string[];
  content?: string;
  connections: MorphismConnection[];
}

export interface StandardMorphism extends BaseMorphism {
  kind: "standard";
}

export interface CompositeMorphism extends BaseMorphism {
  kind: "composite";
  sourceMorphismId: string;
  targetMorphismId: string;
  confidenceScore: number;
  aiInsight: string;
}

export type Morphism = StandardMorphism | CompositeMorphism;

export interface RelatedCandidate {
  morphism: StandardMorphism;
  score: number;
}

export interface ComposeCandidate {
  morphism: StandardMorphism;
  score: number;
}
