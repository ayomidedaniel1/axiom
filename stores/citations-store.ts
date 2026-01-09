import { create } from 'zustand';

export interface Citation {
  index: number;
  title: string;
  url: string;
  excerpt?: string;
}

interface CitationsState {
  citations: Citation[];
  addCitation: (citation: Omit<Citation, 'index'>) => number;
  addCitations: (citations: Omit<Citation, 'index'>[]) => void;
  getCitationByIndex: (index: number) => Citation | undefined;
  clearCitations: () => void;
  parseCitationsFromText: (text: string) => void;
}

export const useCitationsStore = create<CitationsState>((set, get) => ({
  citations: [],

  addCitation: (citation) => {
    const { citations } = get();
    // Check if citation URL already exists
    const existing = citations.find((c) => c.url === citation.url);
    if (existing) return existing.index;

    const newIndex = citations.length + 1;
    set({
      citations: [...citations, { ...citation, index: newIndex }],
    });
    return newIndex;
  },

  addCitations: (newCitations) => {
    const { citations } = get();
    let currentIndex = citations.length;
    const toAdd: Citation[] = [];

    newCitations.forEach((citation) => {
      const existing = citations.find((c) => c.url === citation.url);
      if (!existing && !toAdd.find((c) => c.url === citation.url)) {
        currentIndex++;
        toAdd.push({ ...citation, index: currentIndex });
      }
    });

    if (toAdd.length > 0) {
      set({ citations: [...citations, ...toAdd] });
    }
  },

  getCitationByIndex: (index) => {
    return get().citations.find((c) => c.index === index);
  },

  clearCitations: () => {
    set({ citations: [] });
  },

  // Parse citations from the "## Sources" section of AI response
  parseCitationsFromText: (text) => {
    const sourcesMatch = text.match(/##\s*Sources\s*\n([\s\S]*?)(?:\n##|$)/i);
    if (!sourcesMatch) return;

    const sourcesSection = sourcesMatch[1];
    const citationRegex = /\[(\d+)\]\s*([^-\n]+)\s*-\s*(https?:\/\/[^\s\n]+)/g;
    const newCitations: Omit<Citation, 'index'>[] = [];

    let match;
    while ((match = citationRegex.exec(sourcesSection)) !== null) {
      newCitations.push({
        title: match[2].trim(),
        url: match[3].trim(),
      });
    }

    if (newCitations.length > 0) {
      get().addCitations(newCitations);
    }
  },
}));
