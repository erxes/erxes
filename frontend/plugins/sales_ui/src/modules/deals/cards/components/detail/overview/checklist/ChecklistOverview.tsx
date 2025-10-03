import { Filter, Popover } from 'erxes-ui';

import ChecklistForm from './ChecklistForm';
import { IconListCheck } from '@tabler/icons-react';

const ChecklistOverview = () => {
  return (
    <Popover>
      <Popover.Trigger>
        <Filter.BarButton filterKey="status">
          <div className="flex items-center gap-1">
            <IconListCheck size={16} />
            Add new checklist
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
