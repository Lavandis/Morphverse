import type { CompositeMorphism, Morphism, StandardMorphism } from "@morphverse/domain";
import type { CompositeRepository, MorphismRepository } from "../repositories/repositories";
import { createSeedMorphisms } from "./storage-seed";

export class InMemoryMorphismRepository implements MorphismRepository {
  private morphisms = new Map<string, StandardMorphism>(
    createSeedMorphisms().map((item) => [item.id, item])
  );

  list() {
    return [...this.morphisms.values()];
  }

  getById(id: string) {
    return this.morphisms.get(id);
  }

  save(morphism: Morphism) {
    if (morphism.kind !== "standard") {
      throw new Error(`Cannot save non-standard morphism "${morphism.id}" in MorphismRepository.`);
    }

    this.morphisms.set(morphism.id, morphism);
    return morphism;
  }

  delete(id: string) {
    return this.morphisms.delete(id);
  }

  listStandards() {
    return this.list();
  }
}

export class InMemoryCompositeRepository implements CompositeRepository {
  private composites = new Map<string, CompositeMorphism>();

  list() {
    return [...this.composites.values()];
  }

  save(morphism: CompositeMorphism) {
    this.composites.set(morphism.id, morphism);
    return morphism;
  }

  delete(id: string) {
    return this.composites.delete(id);
  }
}
