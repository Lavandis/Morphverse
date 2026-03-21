import { describe, expect, it } from "vitest";
import { MockMorphverseAi } from "@morphverse/ai";
import { MorphismApplicationService } from "@morphverse/application";
import { InMemoryCompositeRepository, InMemoryMorphismRepository } from "@morphverse/data-access";

describe("MorphismApplicationService", () => {
  it("creates a composite morphism with insight and confidence", () => {
    const service = new MorphismApplicationService({
      morphismRepository: new InMemoryMorphismRepository(),
      compositeRepository: new InMemoryCompositeRepository(),
      ai: new MockMorphverseAi()
    });

    const composite = service.createComposite("morphism-1", "morphism-2");

    expect(composite.kind).toBe("composite");
    expect(composite.aiInsight.length).toBeGreaterThan(0);
    expect(composite.confidenceScore).toBeGreaterThan(0);
  });

  it("updates a standard morphism", () => {
    const service = new MorphismApplicationService({
      morphismRepository: new InMemoryMorphismRepository(),
      compositeRepository: new InMemoryCompositeRepository(),
      ai: new MockMorphverseAi()
    });

    const updated = service.updateMorphism("morphism-1", {
      title: "Updated title",
      input: "updated input",
      output: "updated output",
      tags: ["updated", "crypto"],
      content: "updated content"
    });

    expect(updated.title).toBe("Updated title");
    expect(updated.input).toBe("updated input");
    expect(updated.tags).toEqual(["updated", "crypto"]);
  });

  it("updates only title and content for composites", () => {
    const service = new MorphismApplicationService({
      morphismRepository: new InMemoryMorphismRepository(),
      compositeRepository: new InMemoryCompositeRepository(),
      ai: new MockMorphverseAi()
    });

    const composite = service.createComposite("morphism-1", "morphism-2");
    const updated = service.updateComposite(composite.id, {
      title: "Refined composite",
      content: "Refined content"
    });

    expect(updated.title).toBe("Refined composite");
    expect(updated.content).toBe("Refined content");
    expect(updated.sourceMorphismId).toBe("morphism-1");
  });

  it("deletes a standard morphism and cleans dependent links and composites", () => {
    const service = new MorphismApplicationService({
      morphismRepository: new InMemoryMorphismRepository(),
      compositeRepository: new InMemoryCompositeRepository(),
      ai: new MockMorphverseAi()
    });

    const composite = service.createComposite("morphism-1", "morphism-2");
    service.deleteMorphism("morphism-2");

    expect(service.getMorphism("morphism-2")).toBeUndefined();
    expect(service.getMorphism(composite.id)).toBeUndefined();
    expect(service.getMorphism("morphism-1")).toMatchObject({
      kind: "standard",
      connections: []
    });
  });
});
