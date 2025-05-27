import React from 'react';

interface GenericSectionProps {
  title: string;
  content: string;
}

export function GenericSection({ title, content }: GenericSectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
      <div className="prose prose-sm sm:prose-base max-w-none dark:prose-invert text-muted-foreground leading-relaxed whitespace-pre-line">
        {/* Using a div with whitespace-pre-line to render newlines from string */}
        {content || <p>Content for this section is not yet available.</p>}
      </div>
    </div>
  );
}
