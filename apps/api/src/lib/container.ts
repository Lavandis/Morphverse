import { MockMorphverseAi } from "@morphverse/ai";
import { MorphismApplicationService } from "@morphverse/application";
import {
  FileBackedCompositeRepository,
  FileBackedMorphismRepository,
  JsonFileStorage
} from "@morphverse/data-access";
import { fileURLToPath } from "node:url";

interface MorphismServiceOptions {
  storagePath?: string;
}

function resolveDefaultStoragePath() {
  return fileURLToPath(new URL("../../../../data/morphisms.json", import.meta.url));
}

export function createMorphismService(options: MorphismServiceOptions = {}) {
  const storage = new JsonFileStorage(options.storagePath ?? resolveDefaultStoragePath());
  const morphismRepository = new FileBackedMorphismRepository(storage);
  const compositeRepository = new FileBackedCompositeRepository(storage);
  const ai = new MockMorphverseAi();

  return new MorphismApplicationService({
    morphismRepository,
    compositeRepository,
    ai
  });
}

export const morphismService = createMorphismService();
