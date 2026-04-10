import { Cell } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import { Popover, Command, Combobox, RecordTable } from 'erxes-ui';
import { IconEdit, IconExternalLink } from '@tabler/icons-react';
import { IScoreLog } from '../types/score';

export const getProfileUrl = (ownerId: string, ownerType: string): string => {
  switch (ownerType) {
    case 'customer':
    case 'lead':
      return `/contacts/customers?contactId=${ownerId}`;
    case 'company':
      return `/contacts/companies?companyId=${ownerId}`;
    case 'cpUser':
      return `/contacts/client-portal-users?cpUserId=${ownerId}`;
    case 'user':
      return `/settings/team-member?user_id=${ownerId}`;
    default:
      return `/contacts/customers?contactId=${ownerId}`;
  }
};

export const ScoreMoreColumnCell = ({
  cell,
  onEdit,
}: {
  cell: Cell<IScoreLog, unknown>;
  onEdit?: (record: IScoreLog) => void;
}) => {
  const navigate = useNavigate();
  const record = cell.row.original;
  const { ownerId, ownerType } = record;

  const handleEdit = () => {
    onEdit?.(record);
  };

  const handleSeeProfile = () => {
    if (!ownerId || !ownerType) return;
    navigate(getProfileUrl(ownerId, ownerType));
  };

  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item
              value="edit"
              onSelect={handleEdit}
            >
              <IconEdit size={14} />
              Edit
            </Command.Item>
            <Command.Item
              value="see-profile"
              onSelect={handleSeeProfile}
              disabled={!ownerId}
            >
              <IconExternalLink size={14} />
              See Profile
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const makeScoreMoreColumn = (onEdit?: (record: IScoreLog) => void) => ({
  id: 'more',
  cell: ({ cell }: { cell: Cell<IScoreLog, unknown> }) => (
    <ScoreMoreColumnCell cell={cell} onEdit={onEdit} />
  ),
  size: 25,
});
