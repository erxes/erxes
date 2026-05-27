import { CustomersDelete } from '@/contacts/customers/components/customers-command-bar/delete/CustomersDelete';
import { CustomersMerge } from '@/contacts/customers/components/customers-command-bar/merge/CustomersMerge';
import { CustomersVerificationStatus } from '@/contacts/customers/components/customers-command-bar/CustomersVerificationStatus';
import { CustomersChangeState } from '@/contacts/customers/components/customers-command-bar/CustomersChangeState';
import { ApolloError } from '@apollo/client';
import { Row } from '@tanstack/table-core';
import { CommandBar, RecordTable, Separator, toast } from 'erxes-ui';
import { Can, Export, ICustomer, TagsSelect, useVersion } from 'ui-modules';

export const CustomersCommandBar = () => {
  const { table } = RecordTable.useRecordTable();
  const isOs = useVersion();
  const intersection = (arrays: string[][]): string[] => {
    if (arrays.length === 0) return [];
    return arrays.reduce((common, current) =>
      common.filter((item) => current.includes(item)),
    );
  };

  const customerIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row: Row<ICustomer>) => row.original._id);

  const selectedRows = table.getFilteredSelectedRowModel().rows;

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>{selectedRows.length} selected</CommandBar.Value>
        <Can action="tagsTag">
          <>
            <Separator.Inline />
            <TagsSelect
              type="core:customer"
              mode="multiple"
              variant="secondary"
              className="shadow-none"
              value={
                intersection(
                  selectedRows.map((row) => row.original.tagIds),
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
                    variant: 'destructive',
                  });
                },
              })}
            />
          </>
        </Can>
        <Separator.Inline />
        <Export
          pluginName="core"
          moduleName="contacts"
          collectionName="customers"
          buttonVariant="secondary"
          ids={customerIds}
        />
        {isOs && (
          <Can action="contactsUpdate">
            <>
              <Separator.Inline />
              <CustomersVerificationStatus
                customerIds={customerIds}
                rows={selectedRows}
              />
            </>
          </Can>
        )}
        <Can action="contactsUpdate">
          <>
            <Separator.Inline />
            <CustomersChangeState customerIds={customerIds} rows={selectedRows} />
          </>
        </Can>
        <Can action="contactsMerge">
          <>
            <Separator.Inline />
            <CustomersMerge
              customers={selectedRows.map((row) => row.original)}
              disabled={selectedRows.length !== 2}
              rows={selectedRows}
            />
          </>
        </Can>
        <Can action="contactsDelete">
          <>
            <Separator.Inline />
            <CustomersDelete customerIds={customerIds} />
          </>
        </Can>
      </CommandBar.Bar>
    </CommandBar>
  );
};
