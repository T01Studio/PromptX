export interface PromptVersion {
  id: string;
  template: string;
  timestamp: number;
}

export interface Prompt {
  id: string;
  title: string;
  command: string; // e.g., "xhs"
  categoryId: string;
  template: string; // Current text, may contain {{variables}}
  variables: string[];
  style: string;
  bestFor: string[];
  history: PromptVersion[];
}

export interface Category {
  id: string;
  name: string;
  iconName: string;
}

export type AppView = 'dashboard' | 'playground' | 'arena';
