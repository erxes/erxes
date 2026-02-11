import { RecordTable, Spinner } from 'erxes-ui';
import { useCustomers } from '@/contacts/customers/hooks/useCustomers';
import { createCustomersColumns } from './CustomersColumns';
import { CustomersCommandBar } from '@/contacts/customers/components/customers-command-bar';
import { useIsCustomerLeadSessionKey } from '../hooks/useCustomerLeadSessionKey';
import { ICustomer, useFields, useFieldsColumns } from 'ui-modules';
import { ColumnDef } from '@tanstack/react-table';
import { useCustomerCustomFieldEdit } from '../hooks/useEditCustomerCustomFields';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

export const CustomersRecordTable = () => {
  const { customers, handleFetchMore, loading, pageInfo } = useCustomers();
  const { fields, loading: fieldsLoading } = useFields({
    contentType: 'core:customer',
  });
  const { hasPreviousPage, hasNextPage } = pageInfo || {};
  const { sessionKey } = useIsCustomerLeadSessionKey();
  const { t } = useTranslation('contact');
  const customersColumns = useMemo(() => createCustomersColumns(t), [t]);

  const columns = useFieldsColumns({
    fields,
    mutateHook: useCustomerCustomFieldEdit,
  });

  if (fieldsLoading) return <Spinner />;

  return (
    <RecordTable.Provider
      columns={[...customersColumns, ...columns] as ColumnDef<ICustomer>[]}
      data={customers || [{}]}
      stickyColumns={['more', 'checkbox', 'avatar', 'name']}
      className="m-3"
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={customers?.length}
        sessionKey={sessionKey}
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton
              handleFetchMore={handleFetchMore}
            />
            {loading ? (
              <RecordTable.RowSkeleton rows={32} />
            ) : (
              <RecordTable.RowList />
            )}

            <RecordTable.CursorForwardSkeleton
              handleFetchMore={handleFetchMore}
            />
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.CursorProvider>
      <CustomersCommandBar />
    </RecordTable.Provider>
  );
};
