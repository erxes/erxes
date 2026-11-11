import { IconPlus } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Button, Command, Popover, Spinner } from 'erxes-ui';
import { useEffect, useState } from 'react';

export interface LinkOption {
  id: string;
  label: string;
  detail?: string | null;
}

/** "Add" button that searches records to link (companies of a customer, customers of a company). */
export const LinkPicker = ({
  label,
  queryKey,
  search,
  excludeIds,
  onPick,
}: {
  label: string;
  queryKey: string;
  search: (text: string) => Promise<LinkOption[]>;
  excludeIds: string[];
  onPick: (id: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(text.trim()), 250);

    return () => clearTimeout(timer);
  }, [text]);

  const results = useQuery({
    queryKey: ['link-picker', queryKey, debounced],
    queryFn: () => search(debounced),
    enabled: open,
  });
  const options = (results.data ?? []).filter((option) => !excludeIds.includes(option.id));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button variant="ghost" size="sm" className="h-6 px-1.5 text-xs">
          <IconPlus className="size-3.5" />
          {label}
        </Button>
      </Popover.Trigger>
      <Popover.Content align="end" className="w-72 p-0">
        <Command shouldFilter={false}>
          <Command.Input value={text} onValueChange={setText} placeholder="Search" />
          <Command.List className="max-h-72 p-1">
            {results.isFetching && (
              <div className="flex justify-center py-3">
                <Spinner size="sm" />
              </div>
            )}
            {!results.isFetching && !options.length && <Command.Empty>Nothing found</Command.Empty>}
            {options.map((option) => (
              <Command.Item
                key={option.id}
                value={option.id}
                onSelect={() => {
                  setOpen(false);
                  onPick(option.id);
                }}
              >
                <span className="grid min-w-0 leading-tight">
                  <span className="truncate">{option.label}</span>
                  {option.detail && <span className="truncate text-xs text-muted-foreground">{option.detail}</span>}
                </span>
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </Popover.Content>
    </Popover>
  );
};
