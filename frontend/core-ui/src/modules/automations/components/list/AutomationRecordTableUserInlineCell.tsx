import { useAutomationRecordTableUser } from '@/automations/hooks/useAutomationRecordTableUser';
import { TAutomationRecordTableColumnDefData } from '@/automations/types';
import { IUser } from '@/settings/team-member/types';
import { Cell } from '@tanstack/table-core';
import { Avatar, RecordTableInlineCell } from 'erxes-ui';
import { Link } from 'react-router-dom';

export const AutomationRecordTableUserInlineCell = ({
  cell,
}: {
  cell: Cell<TAutomationRecordTableColumnDefData, unknown>;
}) => {
  const { href, avatarSrc, fullName, initial, name } =
    useAutomationRecordTableUser((cell.getValue() || {}) as IUser);

  return (
    <Link to={href}>
      <RecordTableInlineCell>
        <Avatar className="h-6 w-6 rounded-full">
          <Avatar.Image src={avatarSrc} alt={fullName} />
          <Avatar.Fallback className="rounded-lg text-black">
            {initial}
          </Avatar.Fallback>
        </Avatar>
        {name}
      </RecordTableInlineCell>
    </Link>
  );
};
