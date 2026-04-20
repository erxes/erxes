import { ColumnDef } from '@tanstack/table-core';
import {
  IconLabel,
  IconBrandTabler,
  IconCalendarPlus,
  IconCalendarDot,
} from '@tabler/icons-react';
import {
  RecordTable,
  RecordTableInlineCell,
  TextOverflowTooltip,
  Badge,
  RelativeDateDisplay,
} from 'erxes-ui';
import { getAmenityIconOption } from '../constants/amenityIcons';
import { IAmenity } from '../types/amenity';
import { AmenityEditSheet } from './AmenityEditSheet';
import { amenityMoreColumn } from './AmenityMoreCell';

export const amenityColumns = (
  branchId?: string,
  branchLanguages?: string[],
  mainLanguage?: string,
): ColumnDef<IAmenity>[] => [
  RecordTable.checkboxColumn as ColumnDef<IAmenity>,
  amenityMoreColumn(branchId, branchLanguages, mainLanguage),
  {
    id: 'icon',
    accessorKey: 'icon',
    header: () => (
      <RecordTable.InlineHead icon={IconBrandTabler} label="Icon" />
    ),
    cell: ({ cell }: { cell: any }) => {
      const iconName = cell.getValue() as string;
      const selectedOption = getAmenityIconOption(iconName);
      const Icon = selectedOption?.icon;

      return (
        <div className="flex justify-center items-center h-8">
          {Icon ? (
            <div className="flex justify-center items-center w-7 h-7 p-0.5 rounded border bg-muted/50">
              <Icon size={18} />
            </div>
          ) : (
            <div className="flex justify-center items-center w-7 h-7 p-0.5 rounded border bg-muted/50 text-muted-foreground">
              <IconBrandTabler size={18} />
            </div>
          )}
        </div>
      );
    },
    size: 38,
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead icon={IconLabel} label="Name" />,
    cell: ({ cell, row }: { cell: any; row: any }) => {
      const amenity = row.original as IAmenity;
      return (
        <RecordTableInlineCell>
          <AmenityEditSheet
            amenity={amenity}
            showTrigger={false}
            branchLanguages={branchLanguages}
            mainLanguage={mainLanguage}
          >
            <Badge
              variant="secondary"
              className="px-2 py-1 font-medium cursor-pointer hover:bg-accent"
            >
              <TextOverflowTooltip value={(cell.getValue() as string) || '-'} />
            </Badge>
          </AmenityEditSheet>
        </RecordTableInlineCell>
      );
    },
    size: 300,
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
