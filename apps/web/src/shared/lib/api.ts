import type {
  ComposeCandidate,
  CompositeMorphism,
  Morphism,
  RelatedCandidate,
  StandardMorphism
} from "@morphverse/domain";

interface StandardMorphismPayload {
  title: string;
  input: string;
  output: string;
  tags: string[];
  content?: string;
}

interface CompositePayload {
  title: string;
  content?: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`/api${path}`, {
      headers: {
        "content-type": "application/json; charset=utf-8"
      },
      ...init
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("Morphverse API 未启动或暂时不可用，请先运行 `npm run dev:api`。");
    }

    throw error;
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(payload?.message ?? "Request failed.");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const morphismApi = {
  list() {
    return request<Morphism[]>("/morphisms");
  },
  create(input: StandardMorphismPayload) {
    return request<StandardMorphism>("/morphisms", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },
  update(id: string, input: StandardMorphismPayload) {
    return request<StandardMorphism>(`/morphisms/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input)
    });
  },
  addConnection(id: string, targetMorphismId: string) {
    return request<StandardMorphism>(`/morphisms/${id}/connections`, {
      method: "POST",
      body: JSON.stringify({ targetMorphismId })
    });
  },
  getRelatedCandidates(id: string) {
    return request<RelatedCandidate[]>(`/morphisms/${id}/related-candidates`);
  },
  getComposeCandidates(id: string) {
    return request<ComposeCandidate[]>(`/morphisms/${id}/compose-candidates`);
  },
  createComposite(sourceId: string, targetId: string) {
    return request<CompositeMorphism>("/composites", {
      method: "POST",
      body: JSON.stringify({ sourceId, targetId })
    });
  },
  updateComposite(id: string, input: CompositePayload) {
    return request<CompositeMorphism>(`/composites/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input)
    });
  },
  deleteMorphism(id: string) {
    return request<void>(`/morphisms/${id}`, {
      method: "DELETE"
    });
  },
  deleteComposite(id: string) {
    return request<void>(`/composites/${id}`, {
      method: "DELETE"
    });
  }
};
