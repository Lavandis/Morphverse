import type { ComposeCandidate, RelatedCandidate, StandardMorphism } from "@morphverse/domain";
import type { MorphverseAi } from "../ports/providers";

function scoreByOverlap(base: string, candidate: string) {
  const baseTokens = new Set(base.toLowerCase().split(/\W+/).filter(Boolean));
  const candidateTokens = new Set(candidate.toLowerCase().split(/\W+/).filter(Boolean));
  const shared = [...baseTokens].filter((token) => candidateTokens.has(token)).length;
  return Math.min(0.99, 0.35 + shared * 0.15);
}

export class MockMorphverseAi implements MorphverseAi {
  recommendRelated(current: StandardMorphism, all: StandardMorphism[]): RelatedCandidate[] {
    return all
      .filter((item) => item.id !== current.id)
      .map((morphism) => ({
        morphism,
        score: scoreByOverlap(`${current.input} ${current.output}`, `${morphism.input} ${morphism.output}`)
      }))
      .sort((left, right) => right.score - left.score);
  }

  generate(source: StandardMorphism, target: StandardMorphism) {
    return `AI 将 "${source.output}" 与 "${target.input}" 视为同一认知链路上的连续动作，建议把它们压缩成一条更强的复合态射。`;
  }

  recommendCompose(current: StandardMorphism, all: StandardMorphism[]): ComposeCandidate[] {
    return all
      .filter((item) => item.id !== current.id)
      .map((morphism) => ({
        morphism,
        score: scoreByOverlap(current.output, morphism.input)
      }))
      .sort((left, right) => right.score - left.score);
  }
}
