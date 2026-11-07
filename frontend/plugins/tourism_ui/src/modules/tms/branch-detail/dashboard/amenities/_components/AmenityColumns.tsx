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
import { useTourismPanel } from '@/tms/side-panel/useTourismPanel';
import { TMS_AMENITY_CONTENT_TYPE } from '@/tms/side-panel/tourismPanelTypes';
import { getAmenityIconOption } from '../constants/amenityIcons';
import { IAmenity } from '../types/amenity';
import { amenityMoreColumn } from './AmenityMoreCell';

const AmenityNameCell = ({ amenity }: { amenity: IAmenity }) => {
  const { openDetail } = useTourismPanel(TMS_AMENITY_CONTENT_TYPE);

  return (
    <RecordTableInlineCell>
      <Badge
        variant="secondary"
        className="px-2 py-1 font-medium cursor-pointer hover:bg-accent"
        onClick={() => openDetail(amenity._id)}
      >
        <TextOverflowTooltip value={amenity.name || '-'} />
      </Badge>
    </RecordTableInlineCell>
  );
};

export const amenityColumns = (
  branchId?: string,
  t: (key: string) => string = (k) => k,
): ColumnDef<IAmenity>[] => [
  amenityMoreColumn(branchId),
  RecordTable.checkboxColumn as ColumnDef<IAmenity>,
  {
    id: 'icon',
    accessorKey: 'icon',
    header: () => (
      <RecordTable.InlineHead icon={IconBrandTabler} label={t('icon')} />
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
    header: () => <RecordTable.InlineHead icon={IconLabel} label={t('name')} />,
    cell: ({ row }) => <AmenityNameCell amenity={row.original} />,
    size: 300,
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
