import { MockMorphverseAi } from "@morphverse/ai";
import { MorphismApplicationService } from "@morphverse/application";
import { InMemoryCompositeRepository, InMemoryMorphismRepository } from "@morphverse/data-access";

export function createMorphismService() {
  const morphismRepository = new InMemoryMorphismRepository();
  const compositeRepository = new InMemoryCompositeRepository();
  const ai = new MockMorphverseAi();

  return new MorphismApplicationService({
    morphismRepository,
    compositeRepository,
    ai
  });
}

export const morphismService = createMorphismService();
