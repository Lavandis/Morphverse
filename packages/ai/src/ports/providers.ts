import type { ComposeCandidate, RelatedCandidate, StandardMorphism } from "@morphverse/domain";

export interface RelatedMorphismRecommender {
  recommendRelated(current: StandardMorphism, all: StandardMorphism[]): RelatedCandidate[];
}

export interface ComposableMorphismMatcher {
  recommendCompose(current: StandardMorphism, all: StandardMorphism[]): ComposeCandidate[];
}

export interface CompositeInsightGenerator {
  generate(source: StandardMorphism, target: StandardMorphism): string;
}

export interface MorphverseAi
  extends RelatedMorphismRecommender,
    ComposableMorphismMatcher,
    CompositeInsightGenerator {}
