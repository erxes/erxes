import {
  IconAlignLeft,
  IconChecks,
  IconLabelFilled,
  IconLock,
  IconMail,
  IconMailCheck,
  IconRefresh,
  IconUser,
} from '@tabler/icons-react';
import type { ColumnDef, Cell } from '@tanstack/react-table';

import {
  Avatar,
  Badge,
  Switch,
  useQueryState,
  RecordTable,
  Popover,
  Input,
  FullNameField,
  FullNameValue,
  DatePicker,
  readImage,
  RecordTableInlineCell,
  toast,
  Button,
  Spinner,
} from 'erxes-ui';
import { IUser } from '@/settings/team-member/types';
import { useSetAtom } from 'jotai';
import {
  renderingTeamMemberDetailAtom,
  renderingTeamMemberResetPasswordAtom,
} from '../../states/teamMemberDetailStates';
import { SelectPositions } from 'ui-modules';
import { useUserEdit, useUsersStatusEdit } from '../../hooks/useUserEdit';
import { ChangeEvent, useState } from 'react';
import { SettingsHotKeyScope } from '@/types/SettingsHotKeyScope';
import { format } from 'date-fns';
import { ApolloError } from '@apollo/client';
import { TeamMemberEmailField } from '@/settings/team-member/components/record/team-member-edit/TeammemberEmailField';
import clsx from 'clsx';
import { useResendInvite } from '@/settings/team-member/hooks/useResendInvite';

const UserResetPassword = ({ cell }: { cell: Cell<IUser, unknown> }) => {
  const [, setOpen] = useQueryState('reset_password_id');
  const setRenderingTeamMemberResetPasswordAtom = useSetAtom(
    renderingTeamMemberResetPasswordAtom,
  );

  const { _id } = cell.row.original;

  return (
    <Button
      name="reset-password"
      title="Open a password reset dialog"
      variant={'outline'}
      type="button"
      className="size-6"
      onClick={() => {
        setOpen(_id);
        setRenderingTeamMemberResetPasswordAtom(true);
      }}
    >
      <IconLock />
    </Button>
  );
};

const InvitationResend = ({ cell }: { cell: Cell<IUser, unknown> }) => {
  const { email } = cell.row.original;
  const { resend, loading } = useResendInvite();
  return (
    <Button
      name="resend-invite"
      title="Resend invitation"
      variant={'outline'}
      type="button"
      className="size-6"
      disabled={loading}
      onClick={() =>
        resend({
          variables: {
            email,
          },
          onError: (error) =>
            toast({ title: error.message, variant: 'destructive' }),
          onCompleted: () => toast({ title: 'Invitation has been resent' }),
        })
      }
    >
      {loading ? <Spinner /> : <IconRefresh />}
    </Button>
  );
};

const UsersActionsCell = ({ cell }: { cell: Cell<IUser, unknown> }) => {
  return (
    <RecordTableInlineCell className="justify-center gap-2">
      <InvitationResend cell={cell} />
      <UserResetPassword cell={cell} />
    </RecordTableInlineCell>
  );
};

const teamMemberPasswordResetColumn = {
  id: 'actions',
  header: 'actions',
  cell: UsersActionsCell,
};

export const teamMemberColumns: ColumnDef<IUser>[] = [
  {
    id: 'avatar',
    accessorKey: 'avatar',
    header: () => <RecordTable.InlineHead icon={IconUser} label="" />,
    cell: ({ cell }) => {
      const { details } = cell.row.original;
      const { firstName, lastName, avatar } = details || {};
      return (
        <div className="flex items-center justify-center h-8">
          <Avatar size="lg">
            <Avatar.Image src={readImage(avatar, 200)} />
            <Avatar.Fallback>
              {firstName?.charAt(0) || lastName?.charAt(0) || '-'}
            </Avatar.Fallback>
          </Avatar>
        </div>
      );
    },
    size: 34,
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: () => (
      <RecordTable.InlineHead label="Name" icon={IconLabelFilled} />
    ),
    cell: ({ cell }) => {
      const [, setDetailOpen] = useQueryState('user_id');
      const setRenderingTeamMemberDetail = useSetAtom(
        renderingTeamMemberDetailAtom,
      );
      const { details, _id } = cell.row.original;
      const { firstName, lastName, ...rest } = details || {};

      const { usersEdit } = useUserEdit();

      const onSave = (first: string, last: string) => {
        if (first !== firstName || last !== lastName) {
          usersEdit({
            variables: {
              _id,
              details: {
                ...rest,
                firstName: first,
                lastName: last,
              },
            },
            onError: (error: ApolloError) => {
              toast({
                title: 'Failed to update user details',
                description: error.message,
                variant: 'destructive',
              });
            },
          });
        }
      };

      return (
        <FullNameField
          scope={clsx(SettingsHotKeyScope.UsersPage, _id, 'Name')}
          firstName={firstName}
          lastName={lastName}
          onValueChange={onSave}
        >
          <RecordTableInlineCell.Trigger>
            <Badge
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                setDetailOpen(_id);
                setRenderingTeamMemberDetail(false);
              }}
            >
              <FullNameValue />
            </Badge>
          </RecordTableInlineCell.Trigger>
        </FullNameField>
      );
    },
    size: 240,
  },
  {
    id: 'email',
    accessorKey: 'email',
    header: () => <RecordTable.InlineHead icon={IconMail} label="Email" />,
    cell: ({ cell }) => <TeamMemberEmailField cell={cell} />,
    size: 250,
  },
  ...['employeeId'].map((field) => ({
    id: field,
    accessorKey: field,
    header: () => <RecordTable.InlineHead icon={IconAlignLeft} label={field} />,
    cell: ({ cell }: { cell: Cell<IUser, unknown> }) => {
      const { _id, employeeId } = cell.row.original || {};
      const { usersEdit } = useUserEdit();
      const [open, setOpen] = useState<boolean>(false);
      const [_employeeId, setEmployeeId] = useState<string>(employeeId);
      const onSave = () => {
        if (_employeeId === employeeId) return;
        usersEdit({
          variables: {
            _id,
            employeeId: _employeeId,
          },
        });
      };

      const onChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { value } = event.currentTarget || {};
        setEmployeeId(value);
      };
      return (
        <Popover
          open={open}
          onOpenChange={(open) => {
            setOpen(open);
            if (!open) {
              onSave();
            }
          }}
        >
          <RecordTableInlineCell.Trigger>
            {(employeeId && (
              <Badge variant={'secondary'}>{employeeId}</Badge>
            )) ||
              '-'}
          </RecordTableInlineCell.Trigger>
          <RecordTableInlineCell.Content>
            <Input value={_employeeId} onChange={onChange} />
          </RecordTableInlineCell.Content>
        </Popover>
      );
    },
  })),
  // {
  //   id: 'positionIds',
  //   accessorKey: 'positionIds',
  //   header: () => (
  //     <RecordTable.InlineHead icon={IconAlignLeft} label="Positions" />
  //   ),
  //   cell: ({ cell }) => {
  //     const { _id } = cell.row.original;
  //     const { usersEdit } = useUserEdit();

  //     return (
  //       <SelectPositions.InlineCell
  //         scope={clsx(SettingsHotKeyScope.UsersPage, _id, 'Position')}
  //         mode="multiple"
  //         value={cell.getValue() as string[]}
  //         onValueChange={(value) =>
  //           usersEdit({
  //             variables: {
  //               _id,
  //               positionIds: value,
  //             },
  //           })
  //         }
  //       />
  //     );
  //   },
  //   size: 240,
  // },
  {
    id: 'workStartedDate',
    accessorKey: 'workStartedDate',
    header: () => (
      <RecordTable.InlineHead icon={IconAlignLeft} label="Work started date" />
    ),
    cell: ({ cell }) => {
      const { details, _id } = cell.row.original;
      const { workStartedDate, ...rest } = details || {};
      const [open, setOpen] = useState<boolean>(false);
      const [_workStartedDate, setWorkStartedDate] = useState<Date>(
        workStartedDate || new Date(),
      );
      const { usersEdit } = useUserEdit();
      const onSave = () => {
        if (_workStartedDate === workStartedDate) return;
        usersEdit({
          variables: {
            _id,
            details: {
              ...rest,
              workStartedDate: _workStartedDate,
            },
          },
        });
      };

      const onChange = (date: Date) => {
        setWorkStartedDate(date);
      };

      return (
        <Popover
          open={open}
          onOpenChange={(open) => {
            setOpen(open);
            if (!open) {
              onSave();
            }
          }}
        >
          <RecordTableInlineCell.Trigger>
            {(_workStartedDate &&
              format(new Date(_workStartedDate), 'yyyy/MM/dd')) ||
              'YYYY/MM/DD'}
          </RecordTableInlineCell.Trigger>
          <RecordTableInlineCell.Content>
            <DatePicker
              defaultMonth={workStartedDate}
              value={_workStartedDate}
              onChange={(d) => onChange(d as Date)}
            />
          </RecordTableInlineCell.Content>
        </Popover>
      );
    },
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: () => (
      <RecordTable.InlineHead label="Invitation status	" icon={IconMailCheck} />
    ),
    cell: ({ cell }) => {
      const { status } = cell.row.original;
      return (
        <RecordTableInlineCell>
          <Badge
            variant={
              !status || status === 'Not verified' ? 'destructive' : 'success'
            }
          >
            {status ? (cell.getValue() as string) : 'Not verified'}
          </Badge>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'isActive',
    accessorKey: 'isActive',
    header: () => <RecordTable.InlineHead icon={IconChecks} label="Status" />,
    cell: ({ cell }) => {
      const { _id } = cell.row.original || {};
      const { editStatus } = useUsersStatusEdit();
      return (
        <RecordTableInlineCell>
          <Switch
            className="mx-auto"
            checked={cell.getValue() as boolean}
            onCheckedChange={() => {
              editStatus({
                variables: {
                  _id,
                },
              });
            }}
          />
        </RecordTableInlineCell>
      );
    },
  },
  teamMemberPasswordResetColumn,
];
