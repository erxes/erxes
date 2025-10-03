import { CustomersDelete } from '@/contacts/customers/components/customers-command-bar/delete/CustomersDelete';
import { CommandBar, Separator, RecordTable } from 'erxes-ui';
import { CustomersMerge } from '@/contacts/customers/components/customers-command-bar/merge/CustomersMerge';
import { ICustomer, SelectTags } from 'ui-modules';
import { ApolloError } from '@apollo/client';
import { toast } from 'erxes-ui';
import { Row } from '@tanstack/table-core';

export const CustomersCommandBar = () => {
  const { table } = RecordTable.useRecordTable();
  const intersection = (arrays: string[][]): string[] => {
    if (arrays.length === 0) return [];
    return arrays.reduce((common, current) =>
      common.filter((item) => current.includes(item)),
    );
  };

  const customerIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row: Row<ICustomer>) => row.original._id);
  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {table.getFilteredSelectedRowModel().rows.length} selected
        </CommandBar.Value>
        <Separator.Inline />
        <SelectTags.CommandbarItem
          mode="multiple"
          tagType="core:customer"
          value={
            intersection(
              table
                .getFilteredSelectedRowModel()
                .rows.map((row) => row.original.tagIds),
            ) || []
          }
          targetIds={customerIds}
          options={(newSelectedTagIds) => ({
            update: (cache) => {
              customerIds.forEach((customerId) => {
                cache.modify({
                  id: cache.identify({
                    __typename: 'Customer',
                    _id: customerId,
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
              });
            },
          })}
        />
        <Separator.Inline />
        <CustomersMerge
          customers={table
            .getFilteredSelectedRowModel()
            .rows.map((row) => row.original)}
          disabled={table.getFilteredSelectedRowModel().rows.length != 2}
          rows={table.getFilteredSelectedRowModel().rows}
        />
        <Separator.Inline />
        <CustomersDelete
          customerIds={customerIds}
          rows={table.getFilteredSelectedRowModel().rows}
        />
      </CommandBar.Bar>
    </CommandBar>
  );
};
