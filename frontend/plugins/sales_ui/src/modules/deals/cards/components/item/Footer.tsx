import { IUser } from 'ui-modules';
import { IconCalendar, IconNumber } from '@tabler/icons-react';
import { SelectAssigneeDeal } from '@/deals/components/deal-selects/SelectAssigneeDeal';
import dayjs from 'dayjs';

type Props = {
  createdAt: Date;
  id: string;
  assignedUsers?: IUser[];
  number?: string;
};

export const ItemFooter = ({ number, createdAt, assignedUsers = [], id }: Props) => {
  return (
    <div className="flex justify-between items-center p-2">
      <div className="flex items-center gap-1 text-gray-500 text-xs">
        {number && (
          <>
            <IconNumber className="w-4 h-4" />
            <span>{number}</span>
          </>
        ) || (
            <>
              <IconCalendar className="w-4 h-4" />
              <span>{dayjs(createdAt).format('MMM DD, YYYY')}</span>
            </>
          )
        }
      </div>
      <SelectAssigneeDeal
        variant="card"
        mode="multiple"
        value={assignedUsers.map((user) => user?._id) || ['']}
        id={id}
        teamIds={
          assignedUsers ? assignedUsers.map((user) => user._id) : undefined
        }
      />
    </div>
  );
};
