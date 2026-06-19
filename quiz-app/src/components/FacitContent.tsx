import type { JSX } from 'react';

interface FacitContentProps {
  text: string;
}

function renderInline(text: string): JSX.Element {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export function FacitContent({ text }: FacitContentProps): JSX.Element {
  const blocks = text.split(/\n\n+/);

  return (
    <div className="space-y-3 text-base leading-relaxed text-text-primary">
      {blocks.map((block, index) => {
        const lines = block.split('\n');
        const isList = lines.every(line => line.trim() === '' || line.trim().startsWith('- '));
        const isQuote = lines.every(line => line.trim() === '' || line.trim().startsWith('> '));

        if (isList && lines.some(line => line.trim().startsWith('- '))) {
          return (
            <ul key={index} className="list-disc pl-5 space-y-1 text-text-secondary">
              {lines
                .filter(line => line.trim().startsWith('- '))
                .map((line, li) => (
                  <li key={li}>{renderInline(line.replace(/^- /, ''))}</li>
                ))}
            </ul>
          );
        }

        if (isQuote && lines.some(line => line.trim().startsWith('> '))) {
          return (
            <blockquote
              key={index}
              className="border-l-2 border-accent/40 pl-4 italic text-text-secondary"
            >
              {lines
                .filter(line => line.trim().startsWith('> '))
                .map((line, qi) => (
                  <p key={qi}>{renderInline(line.replace(/^> /, ''))}</p>
                ))}
            </blockquote>
          );
        }

        return (
          <p key={index} className="text-text-secondary">
            {renderInline(block.replace(/\n/g, ' '))}
          </p>
        );
      })}
    </div>
  );
}