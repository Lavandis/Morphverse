import { MockMorphverseAi } from "@morphverse/ai";
import { MorphismApplicationService } from "@morphverse/application";
import { InMemoryCompositeRepository, InMemoryMorphismRepository } from "@morphverse/data-access";

const morphismRepository = new InMemoryMorphismRepository();
const compositeRepository = new InMemoryCompositeRepository();
const ai = new MockMorphverseAi();

export const morphismService = new MorphismApplicationService({
  morphismRepository,
  compositeRepository,
  ai
});
