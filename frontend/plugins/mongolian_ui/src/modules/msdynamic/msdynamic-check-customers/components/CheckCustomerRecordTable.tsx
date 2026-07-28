import { RecordTable } from 'erxes-ui';
import { IconUserX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useCheckCustomer } from '../hooks/useCheckCustomer';
import { checkCustomerColumns } from './CheckCustomerColumns';
import { MS_DYNAMIC_SESSION_KEYS } from '../../constants/msDynamicSessionKey';
import { CheckCustomerCommandBar } from './CheckCustomerCommandBar';

export const CheckCustomerRecordTable = () => {
  const { t } = useTranslation('mongolian');
  const { paginatedItems, pageInfo, checking, checkCustomers } =
    useCheckCustomer();

  return (
    <RecordTable.Provider
      columns={checkCustomerColumns}
      data={paginatedItems}
      className="h-full w-full px-2 overflow-y-auto"
      stickyColumns={['checkbox', 'No']}
    >
      <CheckCustomerCommandBar />
      <RecordTable.CursorProvider
        hasPreviousPage={pageInfo.hasPreviousPage}
        hasNextPage={pageInfo.hasNextPage}
        dataLength={paginatedItems?.length}
        sessionKey={MS_DYNAMIC_SESSION_KEYS.customers}
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton
              handleFetchMore={checkCustomers}
            />
            {checking && <RecordTable.RowSkeleton rows={40} />}
            <RecordTable.RowList />
            <RecordTable.CursorBackwardSkeleton
              handleFetchMore={checkCustomers}
            />
          </RecordTable.Body>
        </RecordTable>
        {!checking && paginatedItems?.length === 0 && (
          <div className="absolute inset-0">
            <div className="h-full w-full px-8 flex justify-center">
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                <div className="mb-6">
                  <IconUserX
                    size={64}
                    className="text-muted-foreground mx-auto mb-4"
                  />
                  <h3 className="text-xl font-semibold mb-2">
                    {t('no-customers-yet')}
                  </h3>
                  <p className="text-muted-foreground max-w-md">
                    {t('get-started-checking')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};

export default CheckCustomerRecordTable;
