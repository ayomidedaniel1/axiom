export interface Citation {
  sourceName: string;
  url: string;
  excerpt: string;
}

export interface ResearchStep {
  id: string;
  type: 'search' | 'extract' | 'reasoning';
  content: string;
  timestamp: number;
}

export interface ResearchReport {
  title: string;
  brief: string;
  content: string; // Markdown
  citations: Array<Citation>;
  steps: Array<ResearchStep>;
}