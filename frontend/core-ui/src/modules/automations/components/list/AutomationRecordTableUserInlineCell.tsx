import { TAutomationRecordTableColumnDefData } from '@/automations/types';
import { IUser } from '@/settings/team-member/types';
import { Cell } from '@tanstack/table-core';
import { Avatar, readImage, RecordTableInlineCell } from 'erxes-ui';
import { Link } from 'react-router-dom';
const generateUserName = (user: IUser) => {
  if (user?.details?.firstName || user?.details?.lastName) {
    return `${user?.details?.firstName || ''} ${user?.details?.lastName || ''}`;
  }

  return user.email;
};
export const AutomationRecordTableUserInlineCell = ({
  cell,
}: {
  cell: Cell<TAutomationRecordTableColumnDefData, any>;
}) => {
  const user = (cell.getValue() || {}) as IUser;
  const { details } = user;
  return (
    <Link to={`/settings/team-member?user_id=${user._id}`}>
      <RecordTableInlineCell>
        <Avatar className="h-6 w-6 rounded-full">
          <Avatar.Image
            src={readImage(details?.avatar)}
            alt={details?.fullName || ''}
          />
          <Avatar.Fallback className="rounded-lg text-black">
            {(details?.fullName || '').split('')[0]}
          </Avatar.Fallback>
        </Avatar>
        {generateUserName(user)}
      </RecordTableInlineCell>
    </Link>
  );
};
