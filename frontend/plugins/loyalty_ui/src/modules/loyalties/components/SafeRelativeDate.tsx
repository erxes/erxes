import { RelativeDateDisplay } from 'erxes-ui';

const parseDateValue = (value: string) => {
  const date = /^\d+$/.test(value) ? new Date(Number(value)) : new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

export const SafeRelativeDate = ({
  value,
  fallback = '—',
}: {
  value?: string;
  fallback?: string;
}) => {
  if (!value) {
    return <span className="text-muted-foreground">{fallback}</span>;
  }

  const isoDate = parseDateValue(value);

  if (!isoDate) {
    return <span className="text-muted-foreground">{fallback}</span>;
  }

  return (
    <RelativeDateDisplay value={isoDate} asChild>
      <RelativeDateDisplay.Value value={isoDate} />
    </RelativeDateDisplay>
  );
};
