import { builtinModelColumns } from '@/data-models/components/BuiltinModelFields';
import { DataModelError } from '@/data-models/components/DataModelFeedback';
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
import { EmailLanesProvider } from '@/settings/email-addresses/contexts/EmailLanes';

export const CustomersRecordTable = () => {
  const {
    customers,
    handleFetchMore,
    loading,
    pageInfo,
    modelFields,
    modelFieldsError,
    retryModelFields,
  } = useCustomers();
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

  const modelColumns = useMemo(
    () => builtinModelColumns<ICustomer>('customer', modelFields),
    [modelFields],
  );
  if (fieldsLoading) return <Spinner />;
  if (modelFieldsError)
    return (
      <DataModelError error={modelFieldsError} onRetry={retryModelFields} />
    );

  return (
    <EmailLanesProvider
      emails={(customers || []).map((customer) => customer.primaryEmail || '')}
    >
      <RecordTable.Provider
        columns={
          [
            ...customersColumns,
            ...modelColumns,
            ...columns,
          ] as ColumnDef<ICustomer>[]
        }
        data={customers || [{}]}
        stickyColumns={['more', 'checkbox', 'avatar', 'name']}
        className="m-3"
        tableId="customers_record_table"
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
    </EmailLanesProvider>
  );
};
