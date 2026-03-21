import type { MorphverseAi } from "@morphverse/ai";
import { createCompositeMorphism, createStandardMorphism, type MorphismConnection } from "@morphverse/domain";
import type { CompositeRepository, MorphismRepository } from "@morphverse/data-access";

interface MorphismApplicationServiceDeps {
  morphismRepository: MorphismRepository;
  compositeRepository: CompositeRepository;
  ai: MorphverseAi;
}

interface CreateMorphismInput {
  title: string;
  input: string;
  output: string;
  tags?: string[];
  content?: string;
}

interface UpdateMorphismInput {
  title: string;
  input: string;
  output: string;
  tags?: string[];
  content?: string;
}

interface UpdateCompositeInput {
  title: string;
  content?: string;
}

export class MorphismApplicationService {
  constructor(private readonly deps: MorphismApplicationServiceDeps) {}

  listMorphisms() {
    return [...this.deps.morphismRepository.list(), ...this.deps.compositeRepository.list()];
  }

  getMorphism(id: string) {
    return (
      this.deps.morphismRepository.getById(id) ??
      this.deps.compositeRepository.list().find((item) => item.id === id)
    );
  }

  createMorphism(input: CreateMorphismInput) {
    const morphism = createStandardMorphism({
      id: `morphism-${Date.now()}`,
      title: input.title,
      input: input.input,
      output: input.output,
      tags: input.tags,
      content: input.content,
      connections: []
    });
    return this.deps.morphismRepository.save(morphism);
  }

  updateMorphism(id: string, input: UpdateMorphismInput) {
    const morphism = this.requireStandard(id);
    const updated = createStandardMorphism({
      id: morphism.id,
      title: input.title,
      input: input.input,
      output: input.output,
      tags: input.tags,
      content: input.content,
      connections: morphism.connections
    });
    return this.deps.morphismRepository.save(updated);
  }

  updateComposite(id: string, input: UpdateCompositeInput) {
    const composite = this.requireComposite(id);
    const updated = {
      ...composite,
      title: input.title.trim(),
      content: input.content?.trim()
    };
    return this.deps.compositeRepository.save(updated);
  }

  addConnection(sourceId: string, targetMorphismId: string) {
    const morphism = this.requireStandard(sourceId);
    const nextConnections = dedupeConnections([
      ...morphism.connections,
      { targetMorphismId, kind: "manual" } satisfies MorphismConnection
    ]);
    const updated = { ...morphism, connections: nextConnections };
    return this.deps.morphismRepository.save(updated);
  }

  getRelatedCandidates(id: string) {
    const morphism = this.requireStandard(id);
    return this.deps.ai.recommendRelated(morphism, this.deps.morphismRepository.listStandards());
  }

  getComposeCandidates(id: string) {
    const morphism = this.requireStandard(id);
    return this.deps.ai.recommendCompose(morphism, this.deps.morphismRepository.listStandards());
  }

  createComposite(sourceId: string, targetId: string) {
    const source = this.requireStandard(sourceId);
    const target = this.requireStandard(targetId);
    const [bestCandidate] = this.deps.ai.recommendCompose(source, [target]);
    const composite = createCompositeMorphism({
      id: `composite-${Date.now()}`,
      title: `${source.title} ∘ ${target.title}`,
      input: source.input,
      output: target.output,
      tags: [...source.tags, ...target.tags, "composite"],
      sourceMorphismId: source.id,
      targetMorphismId: target.id,
      confidenceScore: bestCandidate?.score ?? 0.5,
      aiInsight: this.deps.ai.generate(source, target)
    });
    return this.deps.compositeRepository.save(composite);
  }

  private requireStandard(id: string) {
    const morphism = this.deps.morphismRepository.getById(id);
    if (!morphism || morphism.kind !== "standard") {
      throw new Error(`Standard morphism "${id}" not found.`);
    }
    return morphism;
  }

  private requireComposite(id: string) {
    const composite = this.deps.compositeRepository.list().find((item) => item.id === id);
    if (!composite) {
      throw new Error(`Composite morphism "${id}" not found.`);
    }
    return composite;
  }
}

function dedupeConnections(connections: MorphismConnection[]) {
  const seen = new Set<string>();
  return connections.filter((item) => {
    if (seen.has(item.targetMorphismId)) {
      return false;
    }
    seen.add(item.targetMorphismId);
    return true;
  });
}
