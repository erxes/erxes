import { ApolloError } from '@apollo/client';
import { CommandBar, RecordTable, Separator, toast } from 'erxes-ui';
import { SelectTags } from 'ui-modules';
import { CompaniesDelete } from './CompaniesDelete';

export const CompaniesCommandBar = () => {
  const { table } = RecordTable.useRecordTable();
  const intersection = (arrays: string[][]): string[] => {
    if (arrays.length === 0) return [];
    return arrays.reduce((common, current) =>
      common.filter((item) => current.includes(item)),
    );
  };
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const companyIds = selectedRows.map((row) => row.original._id);
  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>{selectedRows.length} selected</CommandBar.Value>
        <Separator.Inline />
        <SelectTags.CommandbarItem
          mode="multiple"
          tagType="core:company"
          value={intersection(selectedRows.map((row) => row.original.tagIds))}
          targetIds={companyIds}
          options={(newSelectedTagIds) => ({
            update: (cache) => {
              companyIds.forEach((companyId) => {
                cache.modify({
                  id: cache.identify({
                    __typename: 'Company',
                    _id: companyId,
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
        {/* <Separator.Inline />
        <CompaniesMerge
          companies={selectedRows.map((row) => row.original)}
          rows={selectedRows}
        /> */}
        <Separator.Inline />
        <CompaniesDelete companyIds={companyIds} rows={selectedRows} />
      </CommandBar.Bar>
    </CommandBar>
  );
};
