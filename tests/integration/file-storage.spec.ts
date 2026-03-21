import { describe, expect, it } from "vitest";
import { mkdtempSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { JsonFileStorage, FileBackedCompositeRepository, FileBackedMorphismRepository } from "@morphverse/data-access";
import { MockMorphverseAi } from "@morphverse/ai";
import { MorphismApplicationService } from "@morphverse/application";

describe("file-backed storage", () => {
  it("persists morphism updates to a json file", () => {
    const tempDir = mkdtempSync(join(tmpdir(), "morphverse-storage-"));
    const storagePath = join(tempDir, "morphisms.json");
    const firstStorage = new JsonFileStorage(storagePath);
    const firstService = new MorphismApplicationService({
      morphismRepository: new FileBackedMorphismRepository(firstStorage),
      compositeRepository: new FileBackedCompositeRepository(firstStorage),
      ai: new MockMorphverseAi()
    });

    firstService.updateMorphism("morphism-1", {
      title: "Persistent title",
      input: "persistent input",
      output: "persistent output",
      tags: ["saved", "json"],
      content: "persistent content"
    });

    const secondStorage = new JsonFileStorage(storagePath);
    const secondService = new MorphismApplicationService({
      morphismRepository: new FileBackedMorphismRepository(secondStorage),
      compositeRepository: new FileBackedCompositeRepository(secondStorage),
      ai: new MockMorphverseAi()
    });

    expect(secondService.getMorphism("morphism-1")).toMatchObject({
      title: "Persistent title",
      output: "persistent output",
      tags: ["saved", "json"]
    });

    const snapshot = JSON.parse(readFileSync(storagePath, "utf-8")) as {
      morphisms: Array<{ title: string }>;
    };
    expect(snapshot.morphisms.some((item) => item.title === "Persistent title")).toBe(true);
  });
});
