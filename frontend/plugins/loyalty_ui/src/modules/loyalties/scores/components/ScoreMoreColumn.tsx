import { Cell } from '@tanstack/react-table';
import { useState } from 'react';
import { useSetAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { Popover, Command, Combobox, RecordTable } from 'erxes-ui';
import { IconExternalLink, IconListDetails } from '@tabler/icons-react';
import { IScoreLog } from '../types/score';
import { scoreDetailRecordAtom } from '../states/scoreDetail';

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
}: {
  cell: Cell<IScoreLog, unknown>;
}) => {
  const navigate = useNavigate();
  const setDetailRecord = useSetAtom(scoreDetailRecordAtom);
  const record = cell.row.original;
  const { ownerId, ownerType } = record;

  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleSeeProfile = () => {
    if (!ownerId || !ownerType) return;
    setPopoverOpen(false);
    navigate(getProfileUrl(ownerId, ownerType));
  };

  const handleSeeDetail = () => {
    if (!ownerId) return;
    setPopoverOpen(false);
    setDetailRecord(record);
  };

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item
              value="detail"
              onSelect={handleSeeDetail}
              disabled={!ownerId}
            >
              <IconListDetails size={14} />
              Detail
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

export const makeScoreMoreColumn = () => ({
  id: 'more',
  cell: ({ cell }: { cell: Cell<IScoreLog, unknown> }) => (
    <ScoreMoreColumnCell cell={cell} />
  ),
  size: 30,
});
