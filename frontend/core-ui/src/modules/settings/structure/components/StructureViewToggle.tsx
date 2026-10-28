import { IconHierarchy2, IconListTree } from '@tabler/icons-react';
import { Button, ToggleGroup } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useStructureView } from '../hooks/useStructureView';

export const StructureViewToggle = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { view, changeView } = useStructureView();

  return (
    <ToggleGroup type="single" value={view} onValueChange={changeView}>
      <ToggleGroup.Item value="canvas" asChild>
        <Button variant="ghost" size="sm">
          <IconHierarchy2 />
          {t('canvas-view')}
        </Button>
      </ToggleGroup.Item>
      <ToggleGroup.Item value="list" asChild>
        <Button variant="ghost" size="sm">
          <IconListTree />
          {t('list-view')}
        </Button>
      </ToggleGroup.Item>
    </ToggleGroup>
  );
};
