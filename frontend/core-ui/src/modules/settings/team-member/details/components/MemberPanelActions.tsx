import {
  TEAM_MEMBER_ACTION_PERMISSIONS,
  TeamMemberActionItems,
} from '@/settings/team-member/components/record/TeamMemberActionItems';
import { TeamMemberActivityLogSheet } from '@/settings/team-member/components/TeamMemberActivityLogSheet';
import { TeamMembersPath } from '@/settings/team-member/constants/teamMemberRoutes';
import { ResetPasswordDialog } from '@/settings/team-member/details/components/ResetPasswordDialog';
import { IUserDetail } from '@/settings/team-member/types';
import { IconDotsVertical } from '@tabler/icons-react';
import { Button, Combobox, Command, Popover, useQueryState } from 'erxes-ui';
import { useState } from 'react';
import { useLocation } from 'react-router';
import { Can, PrintDocument } from 'ui-modules';

export const MemberPanelActions = ({ user }: { user: IUserDetail }) => {
  const { pathname } = useLocation();
  const [, setSelectedTab] = useQueryState<string>('tab');
  const [resetId] = useQueryState<string>('reset_password_id');
  const [menuOpen, setMenuOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [activityLogOpen, setActivityLogOpen] = useState(false);
  const onMembersPage = pathname.startsWith(
    `${TeamMembersPath.Index}${TeamMembersPath.TeamMembers}`,
  );

  return (
    <>
      <Can actions={TEAM_MEMBER_ACTION_PERMISSIONS}>
        <Popover open={menuOpen} onOpenChange={setMenuOpen}>
          <Popover.Trigger asChild>
            <Button variant="ghost" size="icon" className="size-7">
              <IconDotsVertical className="size-4" />
            </Button>
          </Popover.Trigger>
          <Combobox.Content align="end">
            <Command shouldFilter={false}>
              <TeamMemberActionItems
                user={user}
                onPrint={() => setPrintOpen(true)}
                onEditPermissions={() => setSelectedTab('permissions')}
                onOpenActivityLog={() => setActivityLogOpen(true)}
                onAction={() => setMenuOpen(false)}
              />
            </Command>
          </Combobox.Content>
        </Popover>
      </Can>
      <PrintDocument
        items={[{ _id: user._id }]}
        contentType="core:user"
        open={printOpen}
        onOpenChange={setPrintOpen}
        trigger={null}
      />
      <Can action="broadcastUpdate">
        <TeamMemberActivityLogSheet
          email={user.email}
          open={activityLogOpen}
          onOpenChange={setActivityLogOpen}
        />
      </Can>
      {!onMembersPage && !!resetId && <ResetPasswordDialog />}
    </>
  );
};
