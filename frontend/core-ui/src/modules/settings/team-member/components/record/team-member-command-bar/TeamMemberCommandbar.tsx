import { IUser } from '@/settings/team-member/types';
import { IconRepeat } from '@tabler/icons-react';
import { Row } from '@tanstack/table-core';
import {
  Button,
  Command,
  CommandBar,
  Popover,
  RecordTable,
  Separator,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TeamMemberDelete } from './delete/TeamMemberDelete';
import {
  TeamMemberAssignPermissionsContent,
  TeamMemberAssignPermissionsTrigger,
} from './assign-permissions/TeamMemberAssignPermissions';
import { TeamMemberDeactivate } from './deactivate/TeamMemberDeactivate';
import { TeamMemberResendInvite } from './resend-invite/TeamMemberResendInvite';
import { Can, Export } from 'ui-modules';

export const TeamMemberCommandBar = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const [open, setOpen] = useState(false);
  const [currentContent, setCurrentContent] = useState<'main' | 'permissions'>(
    'main',
  );
  const { table } = RecordTable.useRecordTable();

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const teamMembers = selectedRows.map((row: Row<IUser>) => row.original);
  const teamMemberIds = teamMembers.map(({ _id }) => _id);
  const closeActions = () => {
    setOpen(false);
    setCurrentContent('main');
  };

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
        <Popover
          open={open}
          onOpenChange={(nextOpen) => {
            setOpen(nextOpen);
            if (!nextOpen) {
              setCurrentContent('main');
            }
          }}
        >
          <Popover.Trigger asChild>
            <Button variant="secondary">
              <IconRepeat />
              {t('actions')}
            </Button>
          </Popover.Trigger>
          <Popover.Content
            className="min-w-[280px] p-0"
            align="end"
            side="top"
            sideOffset={10}
          >
            {currentContent === 'main' && (
              <Command>
                <Command.Input />
                <Command.List className="p-0">
                  <Command.Group className="p-1">
                    <TeamMemberAssignPermissionsTrigger
                      onSelect={() => setCurrentContent('permissions')}
                    />
                    <TeamMemberResendInvite
                      teamMembers={teamMembers}
                      onCompleted={closeActions}
                    />
                    <TeamMemberDeactivate
                      teamMembers={teamMembers}
                      onCompleted={closeActions}
                    />
                  </Command.Group>
                  <Command.Separator />
                  <Command.Group className="p-1">
                    <TeamMemberDelete
                      teamMemberIds={teamMemberIds}
                      onCompleted={closeActions}
                    />
                  </Command.Group>
                </Command.List>
              </Command>
            )}
            {currentContent === 'permissions' && (
              <TeamMemberAssignPermissionsContent
                teamMemberIds={teamMemberIds}
                initialGroupIds={
                  teamMembers.length === 1
                    ? teamMembers[0].permissionGroupIds || []
                    : []
                }
                onBack={() => setCurrentContent('main')}
                onClose={closeActions}
              />
            )}
          </Popover.Content>
        </Popover>
      </CommandBar.Bar>
    </CommandBar>
  );
};
