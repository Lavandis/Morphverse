import type { CompositeMorphism, Morphism, StandardMorphism } from "@morphverse/domain";

export interface MorphismRepository {
  list(): Morphism[];
  getById(id: string): Morphism | undefined;
  save(morphism: Morphism): Morphism;
  delete(id: string): boolean;
  listStandards(): StandardMorphism[];
}

export interface CompositeRepository {
  list(): CompositeMorphism[];
  save(morphism: CompositeMorphism): CompositeMorphism;
  delete(id: string): boolean;
}
