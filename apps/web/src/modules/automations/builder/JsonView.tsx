import { z } from 'zod';

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const Leaf = ({ value }: { value: unknown }) => {
  if (value === null || value === undefined)
    return <span className="text-muted-foreground">—</span>;

  if (typeof value === 'boolean') return <span>{value ? 'Yes' : 'No'}</span>;

  if (typeof value === 'string' || typeof value === 'number')
    return <span className="break-all">{String(value)}</span>;

  return null;
};

export const JsonView = ({ value }: { value: unknown }) => {
  const list = z.array(z.unknown()).safeParse(value).data;

  const entries = list
    ? list.map((item, index) => [String(index + 1), item] as const)
    : isObject(value)
      ? Object.entries(value)
      : null;

  if (!entries) return <Leaf value={value} />;

  return (
    <dl className="space-y-0.5 text-xs">
      {entries.map(([key, item]) => (
        <div key={key} className="flex min-w-0 gap-2">
          <dt className="w-28 shrink-0 truncate text-muted-foreground">{key}</dt>
          <dd className="min-w-0 flex-1">
            {Array.isArray(item) || isObject(item) ? (
              <div className="border-l pl-2">
                <JsonView value={item} />
              </div>
            ) : (
              <Leaf value={item} />
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
};
