import { IUser } from '@/settings/team-member/types';
import { IconRepeat } from '@tabler/icons-react';
import { Row } from '@tanstack/table-core';
import { Button, CommandBar, Popover, RecordTable, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { TeamMemberDelete } from './delete/TeamMemberDelete';
import { TeamMemberAssignPermissions } from './assign-permissions/TeamMemberAssignPermissions';
import { TeamMemberDeactivate } from './deactivate/TeamMemberDeactivate';
import { TeamMemberResendInvite } from './resend-invite/TeamMemberResendInvite';
import { Can, Export } from 'ui-modules';

export const TeamMemberCommandBar = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const { table } = RecordTable.useRecordTable();

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const teamMembers = selectedRows.map((row: Row<IUser>) => row.original);
  const teamMemberIds = teamMembers.map(({ _id }) => _id);

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>{selectedRows.length} selected</CommandBar.Value>
        <Can action="teamMembersExportManage">
          <Separator.Inline />
          <Export
            pluginName="core"
            moduleName="user"
            collectionName="user"
            buttonVariant="secondary"
            ids={table
              .getFilteredSelectedRowModel()
              .rows.map((row) => row.original._id)}
          />
        </Can>
        <Separator.Inline />
        <Popover>
          <Popover.Trigger asChild>
            <Button variant="secondary">
              <IconRepeat />
              {t('actions')}
            </Button>
          </Popover.Trigger>
          <Popover.Content
            className="min-w-64 p-1"
            align="end"
            side="top"
            sideOffset={10}
          >
            <div className="flex flex-col gap-1">
              <TeamMemberAssignPermissions teamMemberIds={teamMemberIds} />
              <TeamMemberResendInvite teamMembers={teamMembers} />
              <TeamMemberDeactivate teamMembers={teamMembers} />
              <Separator className="my-1" />
              <TeamMemberDelete teamMemberIds={teamMemberIds} />
            </div>
          </Popover.Content>
        </Popover>
      </CommandBar.Bar>
    </CommandBar>
  );
};
