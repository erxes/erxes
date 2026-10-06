import { Button, cn, useMultiQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export type TAutomationsListView = 'automations' | 'templates';

const VIEWS: { value: TAutomationsListView; labelKey: string }[] = [
  { value: 'automations', labelKey: 'automations' },
  { value: 'templates', labelKey: 'templates' },
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
  const { t } = useTranslation('automations');

  return (
    <div className="flex items-center gap-1 rounded-md bg-muted p-0.5">
      {VIEWS.map(({ value, labelKey }) => (
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
          {t(labelKey)}
        </Button>
      ))}
    </div>
  );
};
