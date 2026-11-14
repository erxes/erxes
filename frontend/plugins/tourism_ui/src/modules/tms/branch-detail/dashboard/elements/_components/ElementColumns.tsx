import { ColumnDef } from '@tanstack/table-core';
import {
  IconCalendarPlus,
  IconClock,
  IconLabel,
  IconCoin,
  IconTags,
  IconCalendarDot,
} from '@tabler/icons-react';
import {
  RecordTable,
  RecordTableInlineCell,
  TextOverflowTooltip,
  RelativeDateDisplay,
  badgeVariants,
  cn,
} from 'erxes-ui';
import { IElement } from '../types/element';
import { elementMoreColumn } from './ElementMoreCell';
import { useTourismPanel } from '@/tms/side-panel/useTourismPanel';
import { TMS_ELEMENT_CONTENT_TYPE } from '@/tms/side-panel/tourismPanelTypes';

const ElementNameBadge = ({
  elementId,
  name,
}: {
  elementId: string;
  name: string;
}) => {
  const { openDetail } = useTourismPanel(TMS_ELEMENT_CONTENT_TYPE);

  return (
    <button
      type="button"
      className={cn(
        badgeVariants({ variant: 'secondary' }),
        'px-2 py-1 font-medium cursor-pointer hover:bg-accent',
      )}
      onClick={() => openDetail(elementId)}
    >
      <TextOverflowTooltip value={name} />
    </button>
  );
};

export const elementColumns = (
  getCategoryNamesByIds: (ids: string[]) => string[],
  branchId?: string,
  t: (key: string) => string = (k) => k,
): ColumnDef<IElement>[] => {
  return [
    elementMoreColumn(branchId),
    RecordTable.checkboxColumn as ColumnDef<IElement>,
    {
      id: 'name',
      accessorKey: 'name',
      header: () => (
        <RecordTable.InlineHead icon={IconLabel} label={t('name')} />
      ),
      cell: ({ cell, row }: { cell: any; row: any }) => {
        const element = row.original as IElement;
        return (
          <RecordTableInlineCell>
            <ElementNameBadge
              elementId={element._id}
              name={(cell.getValue() as string) || '-'}
            />
          </RecordTableInlineCell>
        );
      },
      size: 240,
    },
    {
      id: 'duration',
      accessorKey: 'duration',
      header: () => (
        <RecordTable.InlineHead icon={IconClock} label={t('duration-min')} />
      ),
      cell: ({ cell }: { cell: any }) => (
        <RecordTableInlineCell>
          <TextOverflowTooltip
            value={cell.getValue() ? String(cell.getValue()) : '-'}
          />
        </RecordTableInlineCell>
      ),
      size: 140,
    },
    {
      id: 'cost',
      accessorKey: 'cost',
      header: () => (
        <RecordTable.InlineHead icon={IconCoin} label={t('cost')} />
      ),
      cell: ({ cell }: { cell: any }) => (
        <RecordTableInlineCell>
          <TextOverflowTooltip
            value={cell.getValue() ? String(cell.getValue()) : '-'}
          />
        </RecordTableInlineCell>
      ),
      size: 120,
    },
    {
      id: 'categories',
      accessorKey: 'categories',
      header: () => (
        <RecordTable.InlineHead icon={IconTags} label={t('categories')} />
      ),
      cell: ({ cell }: { cell: any }) => {
        const categoryIds = cell.getValue() as string[];
        if (!categoryIds || categoryIds.length === 0) {
          return (
            <RecordTableInlineCell>
              <TextOverflowTooltip value="-" />
            </RecordTableInlineCell>
          );
        }

        const categoryNames = getCategoryNamesByIds(categoryIds);
        const displayValue =
          categoryNames.length > 0
            ? categoryNames.join(', ')
            : `${categoryIds.length} selected`;

        return (
          <RecordTableInlineCell>
            <TextOverflowTooltip value={displayValue || '-'} />
          </RecordTableInlineCell>
        );
      },
      size: 200,
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: () => (
        <RecordTable.InlineHead icon={IconCalendarPlus} label={t('created')} />
      ),
      cell: ({ cell }: { cell: any }) => {
        return (
          <RelativeDateDisplay value={cell.getValue() as string} asChild>
            <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
              <RelativeDateDisplay.Value value={cell.getValue() as string} />
            </RecordTableInlineCell>
          </RelativeDateDisplay>
        );
      },
      size: 180,
    },
    {
      id: 'modifiedAt',
      accessorKey: 'modifiedAt',
      header: () => (
        <RecordTable.InlineHead icon={IconCalendarDot} label={t('modified')} />
      ),
      cell: ({ cell }: { cell: any }) => {
        return (
          <RelativeDateDisplay value={cell.getValue() as string} asChild>
            <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
              <RelativeDateDisplay.Value value={cell.getValue() as string} />
            </RecordTableInlineCell>
          </RelativeDateDisplay>
        );
      },
      size: 180,
    },
  ];
};
