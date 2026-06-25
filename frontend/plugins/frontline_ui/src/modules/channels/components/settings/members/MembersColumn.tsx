import { useChannelMemberUpdate } from '@/channels/hooks/useChannelMemberUpdate';
import { IChannelMember } from '@/channels/types';
import { Cell, ColumnDef } from '@tanstack/table-core';
import { RecordTable, RecordTableInlineCell, Select } from 'erxes-ui';
import { MembersInline } from 'ui-modules';
import { MemberMoreColumn } from './MemberMoreColumn';
import { useTranslation } from 'react-i18next';

type RowType = { order: string; hasChildren: boolean } & IChannelMember;

const RoleCell = ({ cell }: { cell: Cell<RowType, unknown> }) => {
  const { t } = useTranslation('frontline');
  const { updateChannelMember } = useChannelMemberUpdate();

  const row = cell.row.original;

  const roleHandler = (role: string) => {
    updateChannelMember({
      variables: {
        id: row._id,
        role,
      },
    });
  };
  return (
    <RecordTableInlineCell>
      <Select value={cell.getValue() as string} onValueChange={roleHandler}>
        <Select.Trigger className="w-full h-7 hover:bg-accent-foreground/10 shadow-none">
          <Select.Value placeholder={t('select-role')} />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="admin">
            <p className="text-xs">{t('admin')}</p>
          </Select.Item>
          <Select.Item value="lead">
            <p className="text-xs">{t('lead')}</p>
          </Select.Item>
          <Select.Item value="member">
            <p className="text-xs">{t('member-label')}</p>
          </Select.Item>
        </Select.Content>
      </Select>
    </RecordTableInlineCell>
  );
};

const columns: () => ColumnDef<
  { order: string; hasChildren: boolean } & IChannelMember
>[] = () => [
  MemberMoreColumn,
  {
    ...RecordTable.checkboxColumn,
    size: 5,
  } as ColumnDef<{ order: string; hasChildren: boolean } & IChannelMember>,

  {
    id: 'member',
    accessorKey: 'memberId',
    header: () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { t } = useTranslation('frontline');
      return <RecordTable.InlineHead label={t('member-label')} />;
    },
    cell: ({ row }) => {
      return (
        <RecordTableInlineCell>
          <MembersInline.Provider
            members={row.original.member ? [row.original.member] : []}
          >
            <span className="w-full flex gap-2 items-center">
              <span className="[1lh] flex items-center">
                <MembersInline.Avatar />
              </span>
              <MembersInline.Title />
            </span>
          </MembersInline.Provider>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'role',
    accessorKey: 'role',
    header: () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { t } = useTranslation('frontline');
      return <RecordTable.InlineHead label={t('role-label')} />;
    },
    cell: ({ cell }) => {
      return <RoleCell cell={cell} />;
    },
  },
];

export default columns;
