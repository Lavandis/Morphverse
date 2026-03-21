import { createStandardMorphism, type CompositeMorphism, type Morphism } from "@morphverse/domain";
import type { CompositeRepository, MorphismRepository } from "../repositories/repositories";

const seedMorphisms: Morphism[] = [
  createStandardMorphism({
    id: "seed-1",
    title: "Problem framing",
    input: "任务定义模糊",
    output: "把问题收敛成可验证的接口和边界",
    tags: ["strategy", "product"],
    content: "先定义问题，再定义解。",
    connections: []
  }),
  createStandardMorphism({
    id: "seed-2",
    title: "Interface-first delivery",
    input: "多人协作时频繁相互阻塞",
    output: "先对齐接口，再分模块并行推进",
    tags: ["engineering", "team"],
    content: "接口是协作秩序。",
    connections: []
  }),
  createStandardMorphism({
    id: "seed-3",
    title: "Knowledge compression",
    input: "长文本知识不易复用",
    output: "将经验压缩为输入到输出的态射",
    tags: ["knowledge", "systems"],
    content: "让知识以变换而非分类存在。",
    connections: []
  })
];

export class InMemoryMorphismRepository implements MorphismRepository {
  private morphisms = new Map(seedMorphisms.map((item) => [item.id, item]));

  list() {
    return [...this.morphisms.values()];
  }

  getById(id: string) {
    return this.morphisms.get(id);
  }

  save(morphism: Morphism) {
    this.morphisms.set(morphism.id, morphism);
    return morphism;
  }

  listStandards() {
    return this.list().filter((item) => item.kind === "standard");
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
}
