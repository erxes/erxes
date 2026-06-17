import { IconCurrencyDollar } from '@tabler/icons-react';
import { RecordTable } from 'erxes-ui';
import { MS_DYNAMIC_SESSION_KEYS } from '../../constants/msDynamicSessionKey';
import { checkPriceColumns } from './CheckPriceColumns';
import { useCheckPrice } from '../hooks/useCheckPrice';

export const CheckPriceRecordTable = () => {
  const { filteredItems, checking, checkPrice } = useCheckPrice();

  return (
    <RecordTable.Provider
      columns={checkPriceColumns}
      data={filteredItems || []}
      className="m-3"
      stickyColumns={['code', 'unitPrice']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={false}
        hasNextPage={false}
        dataLength={filteredItems?.length}
        sessionKey={MS_DYNAMIC_SESSION_KEYS.prices}
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton
              handleFetchMore={checkPrice}
            />
            {checking && <RecordTable.RowSkeleton rows={20} />}
            <RecordTable.RowList />
            <RecordTable.CursorForwardSkeleton
              handleFetchMore={checkPrice}
            />
          </RecordTable.Body>
        </RecordTable>
        {!checking && filteredItems?.length === 0 && (
          <div className="absolute inset-0">
            <div className="h-full w-full px-8 flex justify-center">
              <div className="flex flex-col items-center justify-center h-full min-h-[360px] text-center">
                <IconCurrencyDollar
                  size={64}
                  className="text-muted-foreground mx-auto mb-4"
                />
                <h3 className="text-xl font-semibold mb-2">
                  No prices yet
                </h3>
                <p className="text-muted-foreground max-w-md">
                  Select a brand and check prices to get started.
                </p>
              </div>
            </div>
          </div>
        )}
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};
