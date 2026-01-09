'use client';

import { ExternalLink, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useCitationsStore, Citation } from '@/stores/citations-store';
import { ScrollArea } from '@/components/ui/scroll-area';

export function SourcesPanel() {
  const citations = useCitationsStore((state) => state.citations);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (citations.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground/50">
        <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
        <p className="text-xs">Sources will appear here</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <span className="font-medium text-xs tracking-wide text-foreground/80">Sources</span>
        </div>
        <span className="text-[10px] bg-white/5 px-2 py-1 rounded-full text-muted-foreground font-mono">
          {citations.length}
        </span>
      </div>

      {/* Sources List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {citations.map((citation) => (
            <SourceItem
              key={citation.index}
              citation={citation}
              isExpanded={expandedId === citation.index}
              onToggle={() => setExpandedId(expandedId === citation.index ? null : citation.index)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

interface SourceItemProps {
  citation: Citation;
  isExpanded: boolean;
  onToggle: () => void;
}

function SourceItem({ citation, isExpanded, onToggle }: SourceItemProps) {
  const hostname = new URL(citation.url).hostname.replace('www.', '');

  return (
    <div
      id={`source-${citation.index}`}
      className="group rounded-lg border border-white/5 bg-white/[0.02] transition-all duration-300 hover:bg-white/5"
    >
      <div className="flex items-start gap-2 p-2.5">
        {/* Index Badge */}
        <span className="shrink-0 w-5 h-5 rounded-md bg-primary/20 text-primary text-[10px] font-medium flex items-center justify-center">
          {citation.index}
        </span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate leading-tight">{citation.title}</p>
          <p className="text-[10px] text-muted-foreground truncate mt-0.5">{hostname}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <a
            href={citation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 rounded hover:bg-white/10 transition-colors"
            title="Open source"
          >
            <ExternalLink className="w-3 h-3 text-muted-foreground" />
          </a>
          {citation.excerpt && (
            <button
              onClick={onToggle}
              className="p-1 rounded hover:bg-white/10 transition-colors"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <ChevronUp className="w-3 h-3 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Expanded Excerpt */}
      {isExpanded && citation.excerpt && (
        <div className="px-2.5 pb-2.5">
          <p className="text-xs text-muted-foreground bg-black/20 rounded-md p-2 leading-relaxed">
            {citation.excerpt}
          </p>
        </div>
      )}
    </div>
  );
}
