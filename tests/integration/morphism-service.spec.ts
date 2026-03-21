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

    const composite = service.createComposite("seed-1", "seed-2");

    expect(composite.kind).toBe("composite");
    expect(composite.aiInsight.length).toBeGreaterThan(0);
    expect(composite.confidenceScore).toBeGreaterThan(0);
  });
});
