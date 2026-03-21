import { createStandardMorphism, type CompositeMorphism, type Morphism } from "@morphverse/domain";
import type { CompositeRepository, MorphismRepository } from "../repositories/repositories";

const seedMorphisms: Morphism[] = [
  createStandardMorphism({
    id: "morphism-1",
    title: "ZK Rollup onboarding",
    input: "用户不知道为什么 Layer2 值得迁移",
    output: "用成本、吞吐和安全模型解释迁移动机",
    tags: ["crypto", "education"],
    content: "将复杂协议翻译为用户能行动的决策语言。",
    connections: [{ targetMorphismId: "morphism-2", kind: "manual" }]
  }),
  createStandardMorphism({
    id: "morphism-2",
    title: "API contract thinking",
    input: "团队接口频繁破坏前端开发节奏",
    output: "先锁 DTO 与契约，再并行开发",
    tags: ["engineering", "architecture"],
    content: "把变化压缩到适配层，避免蔓延。",
    connections: []
  }),
  createStandardMorphism({
    id: "morphism-3",
    title: "Prompt scaffolding",
    input: "大模型输出不稳定",
    output: "通过上下文骨架和格式约束提高一致性",
    tags: ["ai", "workflow"],
    content: "输出质量往往受输入结构的边界控制。",
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
