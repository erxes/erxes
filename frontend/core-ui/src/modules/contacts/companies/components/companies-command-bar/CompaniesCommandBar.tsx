import { ApolloError } from '@apollo/client';
import { CommandBar, RecordTable, Separator, toast } from 'erxes-ui';
import { Can, Export, TagsSelect } from 'ui-modules';
import { CompaniesDelete } from './CompaniesDelete';
import { useTranslation } from 'react-i18next';

export const CompaniesCommandBar = () => {
  const { t } = useTranslation('contact');
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
        <CommandBar.Value>{t('selected', '{{count}} selected', { count: selectedRows.length })}</CommandBar.Value>
        <Can action="tagsTag">
          <>
            <Separator.Inline />
            <TagsSelect
              mode="multiple"
              variant="secondary"
              className="shadow-none"
              value={
                intersection(
                  table
                    .getFilteredSelectedRowModel()
                    .rows.map((row) => row.original.tagIds),
                ) || []
              }
              type="core:company"
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
                    title: t('error', 'Error'),
                    description: e.message,
                    variant: 'destructive',
                  });
                },
              })}
            />
          </>
        </Can>
        <Can action="companiesExportManage">
          <Separator.Inline />
          <Export
            pluginName="core"
            moduleName="contacts"
            collectionName="companies"
            buttonVariant="secondary"
            ids={companyIds}
          />
        </Can>
        {/* <CompaniesMerge
          companies={table
            .getFilteredSelectedRowModel()
            .rows.map((row) => row.original)}
          // disabled={table.getFilteredSelectedRowModel().rows.length != 2}
          rows={selectedRows} 
        /> */}
        {/* <Separator.Inline /> */}
        <Can action="contactsDelete">
          <>
            <Separator.Inline />
            <CompaniesDelete companyIds={companyIds} />
          </>
        </Can>
      </CommandBar.Bar>
    </CommandBar>
  );
};
