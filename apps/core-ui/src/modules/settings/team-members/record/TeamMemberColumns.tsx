import type { User } from '@erxes/core-contract';
import {
  IconAlignLeft,
  IconLabelFilled,
  IconMail,
  IconMailCheck,
  IconShieldHalf,
  IconUser,
} from '@tabler/icons-react';
import type { ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import {
  Avatar,
  Badge,
  FullNameField,
  FullNameValue,
  readImage,
  RecordTable,
  RecordTableInlineCell,
} from 'erxes-ui';
import { TEAM_MEMBERS_HOTKEY_SCOPE } from '../constants';
import { useOpenMemberPanel } from '../details/useMemberPanel';
import { useMemberPermissions, useTeamMemberEdit } from '../useTeamMembers';
import { TeamMemberEmailField } from './TeamMemberEmailField';
import { TeamMemberWorkStartedField } from './TeamMemberInlineFields';
import { teamMemberMoreColumn } from './TeamMemberMoreColumn';
import { TeamMemberRoleSelect } from './TeamMemberRoleSelect';

/** First and last name for the editor; members named only by `fullName` split it. */
export const nameParts = (user: Pick<User, 'firstName' | 'lastName' | 'fullName'>) => {
  if (user.firstName || user.lastName) {
    return { firstName: user.firstName ?? '', lastName: user.lastName ?? '' };
  }

  const [firstName = '', ...rest] = (user.fullName ?? '').trim().split(/\s+/);

  return { firstName, lastName: rest.join(' ') };
};

export const MemberAvatar = ({ user, className }: { user: User; className?: string }) => {
  const { firstName, lastName } = nameParts(user);

  return (
    <Avatar size="lg" className={className}>
      <Avatar.Image src={readImage(user.avatarUrl ?? '', 200)} />
      <Avatar.Fallback>{firstName.charAt(0) || lastName.charAt(0) || '-'}</Avatar.Fallback>
    </Avatar>
  );
};

/** Name as a badge that opens the member; editable in place like old core-ui. */
const NameCell = ({ user }: { user: User }) => {
  const openPanel = useOpenMemberPanel();
  const edit = useTeamMemberEdit();
  const permissions = useMemberPermissions(user);
  const { firstName, lastName } = nameParts(user);

  const badge = (
    <Badge
      variant="secondary"
      onClick={(event) => {
        event.stopPropagation();
        openPanel(user.id);
      }}
    >
      <FullNameValue />
    </Badge>
  );

  const onSave = (first: string, last: string) => {
    if (first !== firstName || last !== lastName) {
      edit.mutate({ id: user.id, firstName: first || null, lastName: last || null });
    }
  };

  return (
    <FullNameField
      scope={`${TEAM_MEMBERS_HOTKEY_SCOPE}.${user.id}.Name`}
      firstName={firstName}
      lastName={lastName}
      onValueChange={onSave}
    >
      {permissions?.canEdit ? (
        <RecordTableInlineCell.Trigger>{badge}</RecordTableInlineCell.Trigger>
      ) : (
        <RecordTableInlineCell>{badge}</RecordTableInlineCell>
      )}
    </FullNameField>
  );
};

/** Old invitation status: verified once the member can sign in; deactivated members say so. */
const InvitationStatusCell = ({ user, t }: { user: User; t: TFunction }) => (
  <RecordTableInlineCell>
    {user.status === 'disabled' ? (
      <Badge variant="secondary">{t('deactivated', 'Deactivated')}</Badge>
    ) : (
      <Badge variant={user.status === 'invited' ? 'destructive' : 'success'}>
        {user.status === 'invited' ? t('not-verified') : t('verified', 'Verified')}
      </Badge>
    )}
  </RecordTableInlineCell>
);

export const teamMemberColumns = (t: TFunction): ColumnDef<User>[] => [
  teamMemberMoreColumn,
  RecordTable.checkboxColumnOf<User>(),
  {
    id: 'avatar',
    accessorKey: 'avatarUrl',
    header: () => <RecordTable.InlineHead icon={IconUser} label="" />,
    cell: ({ cell }) => (
      <div className="flex items-center justify-center h-8">
        <MemberAvatar user={cell.row.original} />
      </div>
    ),
    size: 34,
  },
  {
    id: 'name',
    accessorKey: 'fullName',
    header: () => <RecordTable.InlineHead label={t('name')} icon={IconLabelFilled} />,
    cell: ({ cell }) => <NameCell user={cell.row.original} />,
    size: 240,
  },
  {
    id: 'email',
    accessorKey: 'email',
    header: () => <RecordTable.InlineHead icon={IconMail} label={t('email')} />,
    cell: ({ cell }) => <TeamMemberEmailField user={cell.row.original} />,
    size: 250,
  },
  {
    id: 'role',
    accessorKey: 'role',
    header: () => <RecordTable.InlineHead icon={IconShieldHalf} label={t('role')} />,
    cell: ({ cell }) => <TeamMemberRoleSelect user={cell.row.original} />,
  },
  {
    id: 'workStartedDate',
    accessorKey: 'workStartedDate',
    header: () => <RecordTable.InlineHead icon={IconAlignLeft} label={t('work-started-date')} />,
    cell: ({ cell }) => <TeamMemberWorkStartedField user={cell.row.original} />,
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: () => <RecordTable.InlineHead icon={IconMailCheck} label={t('invitation-status')} />,
    cell: ({ cell }) => <InvitationStatusCell user={cell.row.original} t={t} />,
  },
];
