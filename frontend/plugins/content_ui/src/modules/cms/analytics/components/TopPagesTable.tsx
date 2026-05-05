import { TopPage } from '../types';

interface TopPagesTableProps {
  data: TopPage[];
  loading?: boolean;
}

export function TopPagesTable({ data, loading }: TopPagesTableProps) {
  const maxPageviews = data[0]?.pageviews || 1;

  return (
    <div className="border rounded-lg p-4 bg-card space-y-3">
      <h3 className="text-sm font-medium">Top Pages</h3>
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 bg-muted animate-pulse rounded" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <p className="text-sm text-muted-foreground">No page data available</p>
      ) : (
        <div className="space-y-2">
          {data.map((page, i) => (
            <div key={i} className="space-y-0.5">
              <div className="flex justify-between items-center text-xs">
                <span
                  className="truncate max-w-[60%] text-muted-foreground"
                  title={page.path}
                >
                  {page.path}
                </span>
                <span className="font-medium tabular-nums">
                  {page.pageviews.toLocaleString()}
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${(page.pageviews / maxPageviews) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
