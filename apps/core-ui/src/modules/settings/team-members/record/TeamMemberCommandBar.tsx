import type { User } from '@erxes/core-contract';
import { IconRepeat, IconToggleLeft } from '@tabler/icons-react';
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
import { useSelectedRows } from '~/components/useSelectedRows';
import { messageOf } from '~/lib/api';
import { useCan, useSession } from '~/modules/auth/session';
import { permissionsFor, useTeamMembersDeactivate } from '../useTeamMembers';

/** Deactivates the selected members; skips yourself, the already deactivated, and owners you cannot manage. */
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

export const TeamMemberCommandBar = ({ rows }: { rows: User[] }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const [open, setOpen] = useState(false);
  const can = useCan();
  const teamMembers = useSelectedRows(rows);

  return (
    <CommandBar open={teamMembers.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>{t('selected', { selectedCount: teamMembers.length })}</CommandBar.Value>
        {can('team.manage') && <Separator.Inline />}
        {can('team.manage') && (
          <Popover open={open} onOpenChange={setOpen}>
            <Popover.Trigger render={<Button variant="secondary" />}>
              <IconRepeat />
              {t('actions')}
            </Popover.Trigger>
            <Popover.Content
              variant="flush"
              className="min-w-70"
              align="end"
              side="top"
              sideOffset={10}
            >
              <Command>
                <Command.Input />
                <Command.List>
                  <Command.Group>
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
