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
  Badge,
  RelativeDateDisplay,
} from 'erxes-ui';
import { IElement } from '../types/element';
import { ElementEditSheet } from './ElementEditSheet';
import { elementMoreColumn } from './ElementMoreCell';

export const elementColumns = (
  getCategoryNamesByIds: (ids: string[]) => string[],
  branchId?: string,
  branchLanguages?: string[],
  mainLanguage?: string,
): ColumnDef<IElement>[] => {
  return [
    RecordTable.checkboxColumn as ColumnDef<IElement>,
    elementMoreColumn(branchId, branchLanguages, mainLanguage),
    {
      id: 'name',
      accessorKey: 'name',
      header: () => <RecordTable.InlineHead icon={IconLabel} label="Name" />,
      cell: ({ cell, row }: { cell: any; row: any }) => {
        const element = row.original as IElement;
        return (
          <RecordTableInlineCell>
            <ElementEditSheet
              element={element}
              branchLanguages={branchLanguages}
              mainLanguage={mainLanguage}
              showTrigger={false}
            >
              <Badge
                variant="secondary"
                className="px-2 py-1 font-medium cursor-pointer hover:bg-accent"
              >
                <TextOverflowTooltip
                  value={(cell.getValue() as string) || '-'}
                />
              </Badge>
            </ElementEditSheet>
          </RecordTableInlineCell>
        );
      },
      size: 240,
    },
    {
      id: 'duration',
      accessorKey: 'duration',
      header: () => (
        <RecordTable.InlineHead icon={IconClock} label="Duration (min)" />
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
      header: () => <RecordTable.InlineHead icon={IconCoin} label="Cost" />,
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
        <RecordTable.InlineHead icon={IconTags} label="Categories" />
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
        <RecordTable.InlineHead icon={IconCalendarPlus} label="Created" />
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
        <RecordTable.InlineHead icon={IconCalendarDot} label="Modified" />
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
