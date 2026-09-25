import { Button, Popover } from 'erxes-ui';

import { ChecklistForm } from './ChecklistForm';
import { IconListCheck } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

export const ChecklistOverview = ({ label }: Readonly<{ label?: string }>) => {
  const { t } = useTranslation('sales');

  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button variant="outline" size="sm" className="h-7 gap-1.5 px-2">
          <IconListCheck />
          {label ?? t('checklist', 'Checklist')}
        </Button>
      </Popover.Trigger>
      <Popover.Content>
        <ChecklistForm />
      </Popover.Content>
    </Popover>
  );
};
