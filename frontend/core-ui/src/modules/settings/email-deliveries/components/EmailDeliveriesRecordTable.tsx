import { EmailDeliveryDetailSheet } from '@/settings/email-deliveries/components/EmailDeliveryDetailSheet';
import { emailDeliveryColumns } from '@/settings/email-deliveries/components/emailDeliveryColumns';
import { EMAIL_DELIVERIES_CURSOR_SESSION_KEY } from '@/settings/email-deliveries/constants';
import { useEmailDeliveries } from '@/settings/email-deliveries/hooks/useEmailDeliveries';
import { IconMailOff } from '@tabler/icons-react';
import { RecordTable } from 'erxes-ui';

export const EmailDeliveriesRecordTable = () => {
  const {
    list,
    loading,
    totalCount,
    handleFetchMore,
    hasNextPage,
    hasPreviousPage,
  } = useEmailDeliveries();

  return (
    <RecordTable.Provider
      columns={emailDeliveryColumns}
      data={list}
      stickyColumns={['status']}
      className="m-2"
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={list?.length}
        sessionKey={EMAIL_DELIVERIES_CURSOR_SESSION_KEY}
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton
              handleFetchMore={handleFetchMore}
            />
            {loading && <RecordTable.RowSkeleton rows={20} />}
            <RecordTable.RowList />
            <RecordTable.CursorForwardSkeleton
              handleFetchMore={handleFetchMore}
            />
          </RecordTable.Body>
        </RecordTable>

        {!totalCount && !loading && (
          <div className="absolute inset-0">
            <div className="flex h-full w-full justify-center px-8">
              <div className="flex h-full min-h-[360px] flex-col items-center justify-center text-center">
                <IconMailOff
                  size={64}
                  className="mx-auto mb-4 text-muted-foreground"
                />
                <h3 className="mb-2 text-xl font-semibold">No emails yet</h3>
                <p className="max-w-md text-muted-foreground">
                  Every message erxes hands to your email provider shows up
                  here, along with what the provider said about it.
                </p>
              </div>
            </div>
          </div>
        )}
      </RecordTable.CursorProvider>

      <EmailDeliveryDetailSheet />
    </RecordTable.Provider>
  );
};
