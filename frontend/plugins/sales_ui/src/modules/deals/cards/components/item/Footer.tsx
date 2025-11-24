import { IUser } from 'ui-modules';
import { IconCalendar } from '@tabler/icons-react';
import { SelectAssigneeDeal } from '@/deals/components/deal-selects/SelectAssigneeDeal';
import dayjs from 'dayjs';

type Props = {
  createdAt: Date;
  id: string;
  assignedUsers?: IUser[];
};

export const ItemFooter = ({ createdAt, assignedUsers = [], id }: Props) => {
  return (
    <div className="flex justify-between items-center p-2">
      <div className="flex items-center gap-1 text-gray-500 text-xs">
        <IconCalendar className="w-4 h-4" />
        <span>{dayjs(createdAt).format('MMM DD, YYYY')}</span>
      </div>
      <SelectAssigneeDeal
        variant="card"
        value={assignedUsers.map((user) => user?._id) || ['']}
        id={id}
        teamIds={
          assignedUsers ? assignedUsers.map((user) => user._id) : undefined
        }
      />
    </div>
  );
};
