const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);

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
  let offset = 0;

  return parts.map((part) => {
    const start = offset;
    offset += part.length;

    if (part.toLowerCase() !== lowerTerm) {
      return part;
    }

    return (
      <mark
        key={`${start}:${part}`}
        className="rounded-[2px] bg-yellow-100 text-foreground dark:bg-yellow-500/25"
      >
        {part}
      </mark>
    );
  });
};
