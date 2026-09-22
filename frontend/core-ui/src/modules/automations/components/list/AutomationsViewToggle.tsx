import { Button, cn, useMultiQueryState } from 'erxes-ui';

export type TAutomationsListView = 'automations' | 'templates';

const VIEWS: { value: TAutomationsListView; label: string }[] = [
  { value: 'automations', label: 'Automations' },
  { value: 'templates', label: 'Templates' },
];

/** Reads/writes the `view` query param that swaps the automations index list. */
export const useAutomationsListView = () => {
  const [queryParams, setQueryParams] = useMultiQueryState<{ view: string }>([
    'view',
  ]);

  const view: TAutomationsListView =
    queryParams.view === 'templates' ? 'templates' : 'automations';

  const setView = (next: TAutomationsListView) =>
    // Keep the default view out of the URL
    setQueryParams({ view: next === 'automations' ? null : next });

  return { view, setView };
};

export const AutomationsViewToggle = () => {
  const { view, setView } = useAutomationsListView();

  return (
    <div className="flex items-center gap-1 rounded-md bg-muted p-0.5">
      {VIEWS.map(({ value, label }) => (
        <Button
          key={value}
          variant="ghost"
          size="sm"
          className={cn(
            'h-7',
            view === value && 'bg-background text-foreground shadow-sm',
          )}
          onClick={() => setView(value)}
        >
          {label}
        </Button>
      ))}
    </div>
  );
};
