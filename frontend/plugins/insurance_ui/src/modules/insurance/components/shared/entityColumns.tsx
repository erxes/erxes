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
import { useTranslation } from 'react-i18next';
import { formatDate } from './formatters';
import { ForwardRefExoticComponent, RefAttributes, ReactNode } from 'react';

type TablerIcon = ForwardRefExoticComponent<IconProps & RefAttributes<Icon>>;

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
  icon: TablerIcon,
  label: string = 'name',
): ColumnDef<T> => ({
  id: 'name',
  accessorKey: 'name',
  header: () => {
    const { t } = useTranslation('insurance');
    return <RecordTable.InlineHead icon={icon} label={t(label)} />;
  },
  cell: ({ cell }) => (
    <RecordTableInlineCell>
      <TextOverflowTooltip value={cell.getValue() as string} />
    </RecordTableInlineCell>
  ),
});

// Description column
export const createDescriptionColumn = <T,>(
  icon: TablerIcon = IconFileDescription,
): ColumnDef<T> => ({
  id: 'description',
  accessorKey: 'description',
  header: () => {
    const { t } = useTranslation('insurance');
    return <RecordTable.InlineHead icon={icon} label={t('description')} />;
  },
  cell: ({ cell }) => (
    <RecordTableInlineCell>
      <TextOverflowTooltip value={(cell.getValue() as string) || '-'} />
    </RecordTableInlineCell>
  ),
});

// Created at column
export const createCreatedAtColumn = <T,>(): ColumnDef<T> => ({
  id: 'createdAt',
  accessorKey: 'createdAt',
  header: () => {
    const { t } = useTranslation('insurance');
    return <RecordTable.InlineHead icon={IconCalendar} label={t('created-at')} />;
  },
  cell: ({ cell }) => (
    <RecordTableInlineCell>
      <TextOverflowTooltip value={formatDate(cell.getValue() as Date)} />
    </RecordTableInlineCell>
  ),
});

// Updated at column
export const createUpdatedAtColumn = <T,>(): ColumnDef<T> => ({
  id: 'updatedAt',
  accessorKey: 'updatedAt',
  header: () => {
    const { t } = useTranslation('insurance');
    return <RecordTable.InlineHead icon={IconCalendar} label={t('updated-at')} />;
  },
  cell: ({ cell }) => (
    <RecordTableInlineCell>
      <TextOverflowTooltip value={formatDate(cell.getValue() as Date)} />
    </RecordTableInlineCell>
  ),
});

// Generic text column factory
export const createTextColumn = <T,>(
  id: string,
  accessorKey: string,
  icon: TablerIcon,
  label: string,
  defaultValue: string = '-',
): ColumnDef<T> => ({
  id,
  accessorKey,
  header: () => {
    const { t } = useTranslation('insurance');
    return <RecordTable.InlineHead icon={icon} label={t(label)} />;
  },
  cell: ({ cell }) => (
    <RecordTableInlineCell>
      <TextOverflowTooltip value={(cell.getValue() as string) || defaultValue} />
    </RecordTableInlineCell>
  ),
});

// Date column factory
export const createDateColumn = <T,>(
  id: string,
  accessorKey: string,
  label: string,
): ColumnDef<T> => ({
  id,
  accessorKey,
  header: () => {
    const { t } = useTranslation('insurance');
    return <RecordTable.InlineHead icon={IconCalendar} label={t(label)} />;
  },
  cell: ({ cell }) => (
    <RecordTableInlineCell>
      <TextOverflowTooltip value={formatDate(cell.getValue() as Date)} />
    </RecordTableInlineCell>
  ),
});
