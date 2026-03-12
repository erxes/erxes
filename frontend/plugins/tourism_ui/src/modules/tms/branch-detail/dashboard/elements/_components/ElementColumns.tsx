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

export const elementColumns = (
  getCategoryNamesByIds: (ids: string[]) => string[],
): ColumnDef<IElement>[] => {
  return [
    RecordTable.checkboxColumn as ColumnDef<IElement>,
    {
      id: 'name',
      accessorKey: 'name',
      header: () => <RecordTable.InlineHead icon={IconLabel} label="Name" />,
      cell: ({ cell, row }: { cell: any; row: any }) => {
        const element = row.original as IElement;
        return (
          <RecordTableInlineCell>
            <ElementEditSheet element={element} showTrigger={false}>
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
        const displayCategories = categoryNames.slice(0, 2);
        const remainingCount = categoryNames.length - 2;

        return (
          <RecordTableInlineCell>
            <div className="flex gap-1 items-center">
              {displayCategories.map((name, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="h-5 px-1.5 text-xs truncate max-w-[80px]"
                >
                  {name}
                </Badge>
              ))}
              {remainingCount > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  +{remainingCount}
                </Badge>
              )}
            </div>
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
