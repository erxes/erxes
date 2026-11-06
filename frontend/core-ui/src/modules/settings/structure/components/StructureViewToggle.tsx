import { IconHierarchy2, IconList } from '@tabler/icons-react';
import { Button, ToggleGroup } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useStructureView } from '../hooks/useStructureView';

export const StructureViewToggle = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { view, changeView } = useStructureView();

  return (
    <ToggleGroup type="single" value={view} onValueChange={changeView}>
      <ToggleGroup.Item value="list" asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('list-view')}
          title={t('list-view')}
        >
          <IconList />
        </Button>
      </ToggleGroup.Item>
      <ToggleGroup.Item value="chart" asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('chart-view')}
          title={t('chart-view')}
        >
          <IconHierarchy2 />
        </Button>
      </ToggleGroup.Item>
    </ToggleGroup>
  );
};
