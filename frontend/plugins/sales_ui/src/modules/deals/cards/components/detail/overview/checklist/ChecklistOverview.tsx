import { Filter, Popover } from 'erxes-ui';

import ChecklistForm from './ChecklistForm';
import { IconListCheck } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

const ChecklistOverview = () => {
  const { t } = useTranslation('sales');
  return (
    <Popover>
      <Popover.Trigger>
        <Filter.BarButton filterKey="status">
          <div className="flex items-center gap-1">
            <IconListCheck size={16} />
            {t('add-new-checklist')}
          </div>
        </Filter.BarButton>
      </Popover.Trigger>
      <Popover.Content>
        <ChecklistForm />
      </Popover.Content>
    </Popover>
  );
};

export default ChecklistOverview;
