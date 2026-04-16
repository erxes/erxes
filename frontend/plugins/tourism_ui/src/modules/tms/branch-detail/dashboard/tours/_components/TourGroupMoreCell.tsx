import { CellContext, ColumnDef } from '@tanstack/react-table';
import { IconPlus } from '@tabler/icons-react';
import { Combobox, Command, Popover, RecordTable } from 'erxes-ui';
import { TourGroupRow } from './TourGroupColumns';

interface TourGroupMoreColumnProps
  extends CellContext<TourGroupRow, unknown> {
  onAddTour?: (row: TourGroupRow) => void;
}

export const TourGroupMoreColumn = ({
  onAddTour,
  ...props
}: TourGroupMoreColumnProps) => {
  const row = props.row.original;
  const canAddTour = row.isGroup || row.isSingleGroupRow;

  if (!canAddTour || !row.templateTourId || !row.groupCode) {
    return <div className="w-full h-full" />;
  }

  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item value="add-tour" onSelect={() => onAddTour?.(row)}>
              <IconPlus className="w-4 h-4" />
              Add tour
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const tourGroupMoreColumn = (
  onAddTour?: (row: TourGroupRow) => void,
): ColumnDef<TourGroupRow> => ({
  id: 'more',
  cell: (props) => <TourGroupMoreColumn {...props} onAddTour={onAddTour} />,
  size: 33,
});
