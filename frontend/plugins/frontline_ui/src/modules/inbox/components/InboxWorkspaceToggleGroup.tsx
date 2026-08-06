import { ToggleGroup, useMultiQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

const TABS = ['assigned-to-me', 'unassigned', 'all'] as const;

type Tab = (typeof TABS)[number];

export const InboxWorkspaceToggleGroup = () => {
  const { t } = useTranslation('frontline');
  const [{ mine, unassigned }, setQueries] = useMultiQueryState<{
    mine: boolean;
    unassigned: boolean;
  }>(['mine', 'unassigned']);

  const activeTab: Tab = mine
    ? 'assigned-to-me'
    : unassigned
    ? 'unassigned'
    : 'all';

  const handleOnChange = (value: string) => {
    if (!value) return;

    setQueries({
      mine: value === 'assigned-to-me' ? true : null,
      unassigned: value === 'unassigned' ? true : null,
    });
  };

  return (
    <ToggleGroup type="single" value={activeTab} onValueChange={handleOnChange}>
      {TABS.map((tab) => (
        <ToggleGroup.Item key={tab} value={tab}>
          {t(tab)}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup>
  );
};
