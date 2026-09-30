import { useMultiQueryState } from 'erxes-ui';

type TAutomationsListView = 'automations' | 'templates';

export const useAutomationsListView = () => {
  const [queryParams] = useMultiQueryState<{ view: string }>(['view']);

  const view: TAutomationsListView =
    queryParams.view === 'templates' ? 'templates' : 'automations';

  return { view };
};
