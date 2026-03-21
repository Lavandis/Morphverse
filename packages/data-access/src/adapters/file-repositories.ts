import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { createCompositeMorphism, createStandardMorphism, type CompositeMorphism, type Morphism } from "@morphverse/domain";
import type { CompositeRepository, MorphismRepository } from "../repositories/repositories";
import {
  createSeedSnapshot,
  normalizeSnapshot,
  type MorphverseStorageSnapshot
} from "./storage-seed";

export class JsonFileStorage {
  constructor(private readonly filePath: string) {
    this.ensureFile();
  }

  read(): MorphverseStorageSnapshot {
    this.ensureFile();
    const raw = JSON.parse(readFileSync(this.filePath, "utf-8")) as MorphverseStorageSnapshot;
    return normalizeSnapshot({
      morphisms: raw.morphisms ?? [],
      composites: raw.composites ?? []
    });
  }

  write(snapshot: MorphverseStorageSnapshot) {
    const normalized = normalizeSnapshot(snapshot);
    mkdirSync(dirname(this.filePath), { recursive: true });
    const tempPath = `${this.filePath}.tmp`;
    writeFileSync(tempPath, JSON.stringify(normalized, null, 2));
    renameSync(tempPath, this.filePath);
  }

  private ensureFile() {
    mkdirSync(dirname(this.filePath), { recursive: true });

    try {
      readFileSync(this.filePath, "utf-8");
    } catch {
      this.write(createSeedSnapshot());
    }
  }
}

export class FileBackedMorphismRepository implements MorphismRepository {
  constructor(private readonly storage: JsonFileStorage) {}

  list() {
    return this.storage.read().morphisms;
  }

  getById(id: string) {
    return this.list().find((item) => item.id === id);
  }

  save(morphism: Morphism) {
    if (morphism.kind !== "standard") {
      throw new Error(`Cannot save non-standard morphism "${morphism.id}" in MorphismRepository.`);
    }

    const snapshot = this.storage.read();
    const normalized = createStandardMorphism(morphism);
    const index = snapshot.morphisms.findIndex((item) => item.id === normalized.id);

    if (index >= 0) {
      snapshot.morphisms[index] = normalized;
    } else {
      snapshot.morphisms.unshift(normalized);
    }

    this.storage.write(snapshot);
    return normalized;
  }

  delete(id: string) {
    const snapshot = this.storage.read();
    const nextMorphisms = snapshot.morphisms.filter((item) => item.id !== id);
    const changed = nextMorphisms.length !== snapshot.morphisms.length;

    if (changed) {
      this.storage.write({
        ...snapshot,
        morphisms: nextMorphisms
      });
    }

    return changed;
  }

  listStandards() {
    return this.list();
  }
}

export class FileBackedCompositeRepository implements CompositeRepository {
  constructor(private readonly storage: JsonFileStorage) {}

  list() {
    return this.storage.read().composites;
  }

  save(morphism: CompositeMorphism) {
    const snapshot = this.storage.read();
    const normalized = createCompositeMorphism(morphism);
    const index = snapshot.composites.findIndex((item) => item.id === normalized.id);

    if (index >= 0) {
      snapshot.composites[index] = normalized;
    } else {
      snapshot.composites.unshift(normalized);
    }

    this.storage.write(snapshot);
    return normalized;
  }

  delete(id: string) {
    const snapshot = this.storage.read();
    const nextComposites = snapshot.composites.filter((item) => item.id !== id);
    const changed = nextComposites.length !== snapshot.composites.length;

    if (changed) {
      this.storage.write({
        ...snapshot,
        composites: nextComposites
      });
    }

    return changed;
  }
}
