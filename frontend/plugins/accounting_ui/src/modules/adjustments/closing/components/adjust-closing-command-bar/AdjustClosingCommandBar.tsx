import { Row } from '@tanstack/table-core';
import { CommandBar, RecordTable, Separator, useToast } from 'erxes-ui';
import { IAdjustClosing } from '../../types/AdjustClosing';
import { AdjustClosingDelete } from './AdjustClosingDelete';
import { ApolloError } from '@apollo/client';
import { TagsSelect } from 'ui-modules';

export const AdjustClosingCommandBar = () => {
  const { table } = RecordTable.useRecordTable();
  const { toast } = useToast();

  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const adjustClosingIds = selectedRows.map(
    (row: Row<IAdjustClosing>) => row.original._id,
  );

  const intersection = (arrays: string[][]): string[] => {
    if (arrays.length === 0) return [];
    return arrays.reduce((common, current) =>
      common.filter((item) => current.includes(item)),
    );
  };

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
          options={(newSelectedTagIds) => ({
            update: (cache) => {
              adjustClosingIds.forEach((id) => {
                cache.modify({
                  id: cache.identify({
                    __typename: 'AdjustClosing',
                    _id: id,
                  }),
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
          })}
        />

        <Separator.Inline />

        <AdjustClosingDelete
          adjustClosingIds={adjustClosingIds}
          rows={selectedRows}
        />
      </CommandBar.Bar>
    </CommandBar>
  );
};
