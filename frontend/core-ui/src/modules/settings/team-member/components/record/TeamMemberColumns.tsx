import {
  IconAlignLeft,
  IconLabelFilled,
  IconMail,
  IconMailCheck,
  IconUser,
} from '@tabler/icons-react';
import type { ColumnDef, Cell } from '@tanstack/react-table';
import { TFunction } from 'i18next';

import {
  Avatar,
  Badge,
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
} from 'erxes-ui';
import { IUser } from '@/settings/team-member/types';
import { useSetAtom } from 'jotai';
import { renderingTeamMemberDetailAtom } from '../../states/teamMemberDetailStates';
import { useUserEdit } from '../../hooks/useUserEdit';
import { ChangeEvent, useState } from 'react';
import { SettingsHotKeyScope } from '@/types/SettingsHotKeyScope';
import { format } from 'date-fns';
import { ApolloError } from '@apollo/client';
import { TeamMemberEmailField } from '@/settings/team-member/components/record/team-member-edit/TeammemberEmailField';
import clsx from 'clsx';
import { teamMemberMoreColumn } from './TeamMemberMoreColumn';

export const teamMemberColumns: (t: TFunction) => ColumnDef<IUser>[] = (t) => {
  return [
    teamMemberMoreColumn,
    RecordTable.checkboxColumn as ColumnDef<IUser>,
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
        <RecordTable.InlineHead label={t('name')} icon={IconLabelFilled} />
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
      header: () => (
        <RecordTable.InlineHead icon={IconMail} label={t('email')} />
      ),
      cell: ({ cell }) => <TeamMemberEmailField cell={cell} />,
      size: 250,
    },
    ...['employeeId'].map((field) => ({
      id: field,
      accessorKey: field,
      header: () => (
        <RecordTable.InlineHead icon={IconAlignLeft} label={t('employeeId')} />
      ),
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
        <RecordTable.InlineHead
          icon={IconAlignLeft}
          label={t('work-started-date')}
        />
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
        <RecordTable.InlineHead
          icon={IconMailCheck}
          label={t('invitation-status')}
        />
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
    // {
    //   id: 'isActive',
    //   accessorKey: 'isActive',
    //   header: () => (
    //     <RecordTable.InlineHead icon={IconChecks} label={t('status')} />
    //   ),
    //   cell: ({ cell }) => {
    //     const { _id } = cell.row.original || {};
    //     const { editStatus } = useUsersStatusEdit();
    //     return (
    //       <RecordTableInlineCell>
    //         <Switch
    //           className="mx-auto"
    //           checked={cell.getValue() as boolean}
    //           onCheckedChange={() => {
    //             editStatus({
    //               variables: {
    //                 _id,
    //               },
    //             });
    //           }}
    //         />
    //       </RecordTableInlineCell>
    //     );
    //   },
    // },

    teamMemberMoreColumn,
  ];
};
