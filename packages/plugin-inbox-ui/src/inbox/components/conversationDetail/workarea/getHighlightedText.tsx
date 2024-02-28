import React from 'react';

function getHighlightedText(text: string, highlight: string) {
  // Split on highlight term and include term into parts, ignore case
  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <strong key={i}>{part}</strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  );
}
export default getHighlightedText;
