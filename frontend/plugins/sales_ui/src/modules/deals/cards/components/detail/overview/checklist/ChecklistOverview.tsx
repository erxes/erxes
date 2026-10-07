import { Popover } from 'erxes-ui';

import { ChecklistForm } from './ChecklistForm';
import { DealChipTrigger } from '@/deals/components/deal-selects/DealChipTrigger';
import { IconListCheck } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

export const ChecklistOverview = ({ label }: Readonly<{ label?: string }>) => {
  const { t } = useTranslation('sales');

  return (
    <Popover>
      <DealChipTrigger>
        <IconListCheck />
        {label ?? t('checklist', 'Checklist')}
      </DealChipTrigger>
      <Popover.Content>
        <ChecklistForm />
      </Popover.Content>
    </Popover>
  );
};
