const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Splits the text on the searched term and marks the matches. The API decides
// what matched, so a hit on a field the row does not render simply comes back
// without a highlight.
export const highlightMatch = (
  text: string,
  searchValue: string,
): React.ReactNode => {
  const term = searchValue.trim();

  if (!term) {
    return text;
  }

  const parts = text.split(new RegExp(`(${escapeRegExp(term)})`, 'ig'));
  const lowerTerm = term.toLowerCase();

  return parts.map((part, index) =>
    part.toLowerCase() === lowerTerm ? (
      <mark
        key={index}
        className="rounded-[2px] bg-yellow-100 text-foreground dark:bg-yellow-500/25"
      >
        {part}
      </mark>
    ) : (
      part
    ),
  );
};
