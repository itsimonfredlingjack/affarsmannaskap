import type { JSX } from 'react';

interface FacitContentProps {
  text: string;
  skipFirstBlock?: boolean;
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

export function FacitContent({ text, skipFirstBlock }: FacitContentProps): JSX.Element {
  const allBlocks = text.split(/\n\n+/);
  const blocks = skipFirstBlock ? allBlocks.slice(1) : allBlocks;

  return (
    <div className="space-y-3 text-base leading-relaxed text-text-primary">
      {blocks.map((block, index) => {
        const trimmed = block.trim();

        if (trimmed === '---') {
          return <hr key={index} className="border-border-subtle my-1" />;
        }

        const headingMatch = trimmed.match(/^(#{2,3})\s+(.+)$/);
        if (headingMatch) {
          const level = headingMatch[1].length;
          const content = headingMatch[2];
          if (level === 2) {
            return <h3 key={index} className="text-lg font-bold text-text-primary mt-3 first:mt-0">{renderInline(content)}</h3>;
          }
          return <h4 key={index} className="text-base font-bold text-text-primary mt-2 first:mt-0">{renderInline(content)}</h4>;
        }

        const lines = block.split('\n');

        const isNumberedList = lines.every(
          line => line.trim() === '' || /^\d+\.\s/.test(line.trim())
        );
        if (isNumberedList && lines.some(line => /^\d+\.\s/.test(line.trim()))) {
          return (
            <ol key={index} className="list-decimal pl-5 space-y-2 text-text-secondary">
              {lines
                .filter(line => /^\d+\.\s/.test(line.trim()))
                .map((line, li) => (
                  <li key={li} className="pl-1">{renderInline(line.trim().replace(/^\d+\.\s/, ''))}</li>
                ))}
            </ol>
          );
        }

        const isList = lines.every(line => line.trim() === '' || line.trim().startsWith('- '));
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

        const isQuote = lines.every(line => line.trim() === '' || line.trim().startsWith('> '));
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
