import { Row } from '@tanstack/table-core';
import { CommandBar, RecordTable, Separator, useToast } from 'erxes-ui';
import { IAdjustClosing } from '../../types/AdjustClosing';
import { AdjustClosingDelete } from './AdjustClosingDelete';
import { ApolloError } from '@apollo/client';
import { TagsSelect } from 'ui-modules';

const intersection = (arrays: string[][]): string[] => {
  if (arrays.length === 0) return [];
  return arrays.reduce((common, current) =>
    common.filter((item) => current.includes(item)),
    []
  );
};

const buildTagSelectOptions = (
  adjustClosingIds: string[],
  newSelectedTagIds: string[],
  toast: ReturnType<typeof useToast>['toast'],
) => ({
  update: (cache: any) => {
    adjustClosingIds.forEach((id) => {
      cache.modify({
        id: cache.identify({ __typename: 'AdjustClosing', _id: id }),
        fields: {
          tagIds: () => newSelectedTagIds,
        },
      });
    });
  },
  onError: (e: ApolloError) => {
    toast({
      title: 'Error',
      description: e.message,
      variant: 'destructive',
    });
  },
});

export const AdjustClosingCommandBar = () => {
  const { table } = RecordTable.useRecordTable();
  const { toast } = useToast();

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedRow = table.getFilteredSelectedRowModel().rows[0];

  const adjustClosingIds = selectedRows.map(
    (row: Row<IAdjustClosing>) => row.original._id,
  );

  const commonTagIds =
    intersection(selectedRows.map((row) => row.original.tagIds || [])) || [];

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>{selectedRows.length} selected</CommandBar.Value>
        <Separator.Inline />
        <TagsSelect
          type="core:adjustClosing"
          mode="multiple"
          variant="secondary"
          className="shadow-none"
          value={commonTagIds}
          targetIds={adjustClosingIds}
          options={(newSelectedTagIds) =>
            buildTagSelectOptions(adjustClosingIds, newSelectedTagIds, toast)
          }
        />
        <Separator.Inline />
        {selectedRow && <AdjustClosingDelete row={selectedRow} />}
      </CommandBar.Bar>
    </CommandBar>
  );
};
