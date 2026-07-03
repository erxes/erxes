import {
  IconCalendar,
  IconFileDescription,
  Icon,
  IconProps,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
} from 'erxes-ui';
import { formatDate } from './formatters';
import { ForwardRefExoticComponent, RefAttributes } from 'react';

type TablerIcon = ForwardRefExoticComponent<IconProps & RefAttributes<Icon>>;
type TFunc = (key: string, defaultValue?: string) => string;

// Generic more column factory
export const createEntityMoreColumn = <T,>(
  MoreComponent: React.ComponentType<{ cell: any }>,
  size: number = 26,
): ColumnDef<T> => ({
  id: 'more',
  accessorKey: 'more',
  header: '',
  cell: ({ cell }) => <MoreComponent cell={cell} />,
  size,
});

// Generic name column factory
export const createNameColumn = <T,>(
  t: TFunc,
  icon: TablerIcon,
  label: string = 'name',
): ColumnDef<T> => ({
  id: 'name',
  accessorKey: 'name',
  header: () => {
    return <RecordTable.InlineHead icon={icon} label={t(label, 'Name')} />;
  },
  cell: ({ cell }) => (
    <RecordTableInlineCell>
      <TextOverflowTooltip value={cell.getValue() as string} />
    </RecordTableInlineCell>
  ),
});

// Description column
export const createDescriptionColumn = <T,>(
  t: TFunc,
  icon: TablerIcon = IconFileDescription,
): ColumnDef<T> => ({
  id: 'description',
  accessorKey: 'description',
  header: () => {
    return (
      <RecordTable.InlineHead
        icon={icon}
        label={t('description', 'Description')}
      />
    );
  },
  cell: ({ cell }) => (
    <RecordTableInlineCell>
      <TextOverflowTooltip value={(cell.getValue() as string) || '-'} />
    </RecordTableInlineCell>
  ),
});

// Created at column
export const createCreatedAtColumn = <T,>(t: TFunc): ColumnDef<T> => ({
  id: 'createdAt',
  accessorKey: 'createdAt',
  header: () => {
    return (
      <RecordTable.InlineHead
        icon={IconCalendar}
        label={t('created-at', 'Created at')}
      />
    );
  },
  cell: ({ cell }) => (
    <RecordTableInlineCell>
      <TextOverflowTooltip value={formatDate(cell.getValue() as Date)} />
    </RecordTableInlineCell>
  ),
});

// Updated at column
export const createUpdatedAtColumn = <T,>(t: TFunc): ColumnDef<T> => ({
  id: 'updatedAt',
  accessorKey: 'updatedAt',
  header: () => {
    return (
      <RecordTable.InlineHead
        icon={IconCalendar}
        label={t('updated-at', 'Updated at')}
      />
    );
  },
  cell: ({ cell }) => (
    <RecordTableInlineCell>
      <TextOverflowTooltip value={formatDate(cell.getValue() as Date)} />
    </RecordTableInlineCell>
  ),
});

// Generic text column factory
export const createTextColumn = <T,>(
  t: TFunc,
  id: string,
  accessorKey: string,
  icon: TablerIcon,
  label: string,
  defaultValue: string = '-',
): ColumnDef<T> => ({
  id,
  accessorKey,
  header: () => {
    return <RecordTable.InlineHead icon={icon} label={t(label, label)} />;
  },
  cell: ({ cell }) => (
    <RecordTableInlineCell>
      <TextOverflowTooltip
        value={(cell.getValue() as string) || defaultValue}
      />
    </RecordTableInlineCell>
  ),
});

// Date column factory
export const createDateColumn = <T,>(
  t: TFunc,
  id: string,
  accessorKey: string,
  label: string,
): ColumnDef<T> => ({
  id,
  accessorKey,
  header: () => {
    return (
      <RecordTable.InlineHead icon={IconCalendar} label={t(label, label)} />
    );
  },
  cell: ({ cell }) => (
    <RecordTableInlineCell>
      <TextOverflowTooltip value={formatDate(cell.getValue() as Date)} />
    </RecordTableInlineCell>
  ),
});
