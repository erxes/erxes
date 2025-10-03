import { IUser, MembersInline } from 'ui-modules';

import { IconCalendar } from '@tabler/icons-react';
import dayjs from 'dayjs';

type Props = {
  createdAt: Date;
  assignedUsers?: IUser[];
};

export const ItemFooter = ({ createdAt, assignedUsers = [] }: Props) => {
  return (
    <div className="flex justify-between items-center border-t p-2">
      <div className="flex items-center gap-1 text-gray-500 text-xs">
        <IconCalendar className="w-4 h-4" />
        <span>{dayjs(createdAt).format('MMM DD, YYYY')}</span>
      </div>
      <div className="flex">
        <MembersInline.Provider
          memberIds={assignedUsers.map((user) => user._id)}
        >
          <MembersInline.Avatar />
        </MembersInline.Provider>
      </div>
    </div>
  );
};
