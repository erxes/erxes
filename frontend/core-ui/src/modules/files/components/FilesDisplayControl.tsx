import { IconLayoutGrid, IconList } from '@tabler/icons-react';
import { Button, ToggleGroup } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useFilesLayout } from '../hooks/useFilesLayout';

export const FilesDisplayControl = () => {
  const { t } = useTranslation('files');
  const { layout, changeLayout } = useFilesLayout();

  return (
    <ToggleGroup type="single" value={layout} onValueChange={changeLayout}>
      <ToggleGroup.Item value="list" asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('list')}
          title={t('list')}
        >
          <IconList />
        </Button>
      </ToggleGroup.Item>
      <ToggleGroup.Item value="grid" asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('grid')}
          title={t('grid')}
        >
          <IconLayoutGrid />
        </Button>
      </ToggleGroup.Item>
    </ToggleGroup>
  );
};
