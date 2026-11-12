import type { User } from '@erxes/core-contract';
import { IconRepeat, IconToggleLeft } from '@tabler/icons-react';
import type { Row } from '@tanstack/react-table';
import {
  Button,
  Command,
  CommandBar,
  Popover,
  RecordTable,
  Separator,
  Spinner,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { messageOf } from '~/lib/api';
import { useCan, useSession } from '~/modules/auth/session';
import { permissionsFor, useTeamMembersDeactivate } from '../useTeamMembers';

/** Old `TeamMemberDeactivate`: skips yourself, the already deactivated, and owners you cannot manage. */
const TeamMemberDeactivate = ({
  teamMembers,
  onCompleted,
}: {
  teamMembers: User[];
  onCompleted: () => void;
}) => {
  const { confirm } = useConfirm();
  const { mutate, isPending } = useTeamMembersDeactivate();
  const { table } = RecordTable.useRecordTable();
  const { toast } = useToast();
  const { user: me } = useSession();
  const can = useCan();
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });

  const teamMemberIds = teamMembers
    .filter(
      (teamMember) =>
        teamMember.status !== 'disabled' && permissionsFor(me, teamMember, can).canToggle,
    )
    .map((teamMember) => teamMember.id);

  return (
    <Command.Item
      disabled={isPending || teamMemberIds.length === 0}
      onSelect={() =>
        void confirm({
          message: t('confirm-deactivate-team-members', { count: teamMemberIds.length }),
        }).then(() =>
          mutate(teamMemberIds, {
            onSuccess: (count) => {
              table.setRowSelection({});
              onCompleted();
              toast({
                title: t('success'),
                variant: 'success',
                description: t('team-members-deactivated', { count }),
              });
            },
            onError: (error) =>
              toast({ title: t('error'), description: messageOf(error), variant: 'destructive' }),
          }),
        )
      }
    >
      {isPending ? <Spinner size="sm" /> : <IconToggleLeft />}
      {t('deactivate')}
    </Command.Item>
  );
};

export const TeamMemberCommandBar = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const [open, setOpen] = useState(false);
  const { table } = RecordTable.useRecordTable();
  const { user: me } = useSession();
  const can = useCan();

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const teamMembers = selectedRows.map((row: Row<User>) => row.original);

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>{t('selected', { selectedCount: selectedRows.length })}</CommandBar.Value>
        {can('team.manage') && <Separator.Inline />}
        {can('team.manage') && (
          <Popover open={open} onOpenChange={setOpen}>
            <Popover.Trigger asChild>
              <Button variant="secondary">
                <IconRepeat />
                {t('actions')}
              </Button>
            </Popover.Trigger>
            <Popover.Content className="min-w-[280px] p-0" align="end" side="top" sideOffset={10}>
              <Command>
                <Command.Input />
                <Command.List className="p-0">
                  <Command.Group className="p-1">
                    <TeamMemberDeactivate
                      teamMembers={teamMembers}
                      onCompleted={() => setOpen(false)}
                    />
                  </Command.Group>
                </Command.List>
              </Command>
            </Popover.Content>
          </Popover>
        )}
      </CommandBar.Bar>
    </CommandBar>
  );
};
