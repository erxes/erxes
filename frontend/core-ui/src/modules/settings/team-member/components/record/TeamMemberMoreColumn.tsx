import { Cell } from '@tanstack/react-table';
import { useSetAtom } from 'jotai';
import { RecordTable, useQueryState } from 'erxes-ui';
import { IUser } from '@/settings/team-member/types';
import { renderingTeamMemberDetailAtom } from '@/settings/team-member/states/teamMemberDetailStates';

export const TeamMemberMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IUser, unknown>;
}) => {
  const [, setOpen] = useQueryState('user_id');
  const setRenderingTeamMemberDetail = useSetAtom(
    renderingTeamMemberDetailAtom,
  );
  const { _id } = cell.row.original;
  return (
    <RecordTable.MoreButton
      className="w-full h-full"
      onClick={() => {
        setOpen(_id);
        setRenderingTeamMemberDetail(false);
      }}
    />
  );
};

export const teamMemberMoreColumn = {
  id: 'more',
  cell: TeamMemberMoreColumnCell,
  size: 33,
};
