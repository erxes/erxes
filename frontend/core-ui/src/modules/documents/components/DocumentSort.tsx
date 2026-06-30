import { IconSortDescending2Filled } from '@tabler/icons-react';
import { Button, DropdownMenu } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const DocumentSort = () => {
  const { t } = useTranslation('documents');
  return (
    <>
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <Button variant="ghost">
            <IconSortDescending2Filled className="w-4 h-4" />
          </Button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Content>
          <DropdownMenu.Item>{t('newest-first', 'Newest First')}</DropdownMenu.Item>
          <DropdownMenu.Item>{t('oldest-first', 'Oldest First')}</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    </>
  );
};
