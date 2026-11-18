/**
 * Where a unit sits, from its `ancestorNames`. The organisation's own unit, above every unit, is
 * left out, and the parent stays in sight while the units above it truncate, so two hits with
 * the same name read apart.
 */
export const UnitPath = ({ names }: { names: string[] }) => {
  const shown = names.slice(1);
  const parent = shown.at(-1);

  if (!parent) return null;

  const above = shown.slice(0, -1);

  return (
    <span className="flex min-w-0 text-xs text-muted-foreground">
      {above.length > 0 && (
        <>
          <span className="min-w-0 truncate">{above.join(' › ')}</span>
          <span className="shrink-0 whitespace-pre"> › </span>
        </>
      )}
      <span className="max-w-full shrink-0 truncate">{parent}</span>
    </span>
  );
};
