'use client';

import { useCitationsStore } from '@/stores/citations-store';

interface CitationLinkProps {
  index: number;
  className?: string;
}

export function CitationLink({ index, className = '' }: CitationLinkProps) {
  const citation = useCitationsStore((state) => state.getCitationByIndex(index));

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById(`source-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add highlight animation
      element.classList.add('highlight-source');
      setTimeout(() => element.classList.remove('highlight-source'), 2000);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`
        inline-flex items-center justify-center
        text-[10px] font-medium
        min-w-[18px] h-[18px] px-1
        bg-primary/20 text-primary
        rounded-sm
        hover:bg-primary/30 hover:scale-110
        transition-all duration-150
        cursor-pointer
        align-super
        ${className}
      `}
      title={citation?.title || `Source ${index}`}
    >
      {index}
    </button>
  );
}
