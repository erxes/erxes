import { TAiAgentMemoryItem } from '@/automations/components/settings/components/agents/hooks/useAiAgentMemoryItems';
import { IconAlertTriangle, IconSearch } from '@tabler/icons-react';
import { cn, Input, Skeleton } from 'erxes-ui';
import { useState } from 'react';

const GROUPS: TAiAgentMemoryItem['group'][] = ['Always on', 'Files', 'Sources'];

export const AiAgentMemoryList = ({
  items,
  loading,
  activeKey,
  onSelect,
}: {
  items: TAiAgentMemoryItem[];
  loading: boolean;
  activeKey: string;
  onSelect: (key: string) => void;
}) => {
  const [search, setSearch] = useState('');
  const query = search.trim().toLowerCase();
  const visibleItems = items.filter(
    (item) => !query || item.label.toLowerCase().includes(query),
  );

  return (
    <nav className="flex max-h-72 min-h-0 flex-col gap-3 border-b pb-3 md:max-h-none md:border-b-0 md:border-r md:pb-0 md:pr-3">
      <div className="relative">
        <IconSearch className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search memory"
          className="pl-8"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {GROUPS.map((group) => {
          const groupItems = visibleItems.filter(
            (item) => item.group === group,
          );

          if (!groupItems.length && !(group === 'Sources' && loading)) {
            return null;
          }

          return (
            <div key={group} className="mb-3">
              <p className="px-2 pb-1 text-xs text-muted-foreground">{group}</p>
              {groupItems.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => onSelect(item.key)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors',
                      item.key === activeKey
                        ? 'bg-muted font-medium text-foreground shadow-[inset_2px_0_0_var(--primary)]'
                        : 'text-muted-foreground hover:bg-muted/60',
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="min-w-0 flex-1 truncate">
                      {item.label}
                    </span>
                    {item.warning ? (
                      <IconAlertTriangle className="size-4 shrink-0 text-warning" />
                    ) : (
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {item.meta}
                      </span>
                    )}
                  </button>
                );
              })}
              {group === 'Sources' && loading && (
                <Skeleton className="mx-2 h-7" />
              )}
            </div>
          );
        })}
        {!visibleItems.length && (
          <p className="px-2 text-sm text-muted-foreground">
            Nothing matches “{search}”.
          </p>
        )}
      </div>
    </nav>
  );
};
