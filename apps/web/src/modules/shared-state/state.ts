import type { CopilotMode } from "@morphverse/domain";

export interface CopilotContext {
  mode: CopilotMode;
  morphismId: string;
}

export interface UiState {
  drawerOpen: boolean;
  copilotMode: CopilotMode | null;
  copilotContext: CopilotContext | null;
}

export function createInitialUiState(): UiState {
  return {
    drawerOpen: false,
    copilotMode: null,
    copilotContext: null
  };
}
