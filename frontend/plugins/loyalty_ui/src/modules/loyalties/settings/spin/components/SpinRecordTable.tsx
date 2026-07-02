import { RecordTable } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

import { spinColumns } from './SpinColumns';
import { SpinCommandBar } from './spin-command-bar/SpinCommandBar';
import { useSpins } from '../hooks/useSpins';
import { SPINS_CURSOR_SESSION_KEY } from '../constants/spinsCursorSessionKey';

import { IconHeart } from '@tabler/icons-react';
import { LoyaltySpinAddSheet } from './SpinAddSheet';

export const SpinRecordTable = () => {
  const { t } = useTranslation('loyalty');
  const { spins, handleFetchMore, loading, pageInfo } = useSpins();

  const { hasPreviousPage, hasNextPage } = pageInfo || {};
  return (
    <RecordTable.Provider
      columns={spinColumns}
      data={spins || []}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'title']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={spins?.length}
        sessionKey={SPINS_CURSOR_SESSION_KEY}
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton
              handleFetchMore={handleFetchMore}
            />
            {loading && <RecordTable.RowSkeleton rows={40} />}
            <RecordTable.RowList />
            <RecordTable.CursorForwardSkeleton
              handleFetchMore={handleFetchMore}
            />
          </RecordTable.Body>
        </RecordTable>
        {!loading && spins?.length === 0 && (
          <div>
            <div className=" h-full w-full px-8 flex justify-center">
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                <div className="mb-6">
                  <IconHeart
                    size={64}
                    className="text-muted-foreground mx-auto mb-4"
                  />
                  <h3 className="text-xl font-semibold mb-2">{t('no-spins-yet')}</h3>
                  <p className="text-muted-foreground max-w-md">
                    {t('get-started-spin')}
                  </p>
                </div>
                <LoyaltySpinAddSheet />
              </div>
            </div>
          </div>
        )}
      </RecordTable.CursorProvider>
      <SpinCommandBar />
    </RecordTable.Provider>
  );
};
