import { EmailDeliveryDetailSheet } from '@/settings/email-deliveries/components/EmailDeliveryDetailSheet';
import { emailDeliveryColumns } from '@/settings/email-deliveries/components/emailDeliveryColumns';
import { EMAIL_DELIVERIES_CURSOR_SESSION_KEY } from '@/settings/email-deliveries/constants';
import { useEmailDeliveries } from '@/settings/email-deliveries/hooks/useEmailDeliveries';
import { IconMailOff } from '@tabler/icons-react';
import { Button, RecordTable, toast } from 'erxes-ui';

const memberColumns = emailDeliveryColumns.filter(
  ({ id }) => id !== 'source' && id !== 'provider',
);

export const EmailDeliveriesRecordTable = ({
  email,
}: { email?: string } = {}): JSX.Element => {
  const {
    list,
    loading,
    totalCount,
    error,
    refetch,
    handleFetchMore,
    hasNextPage,
    hasPreviousPage,
  } = useEmailDeliveries(
    email
      ? {
          variables: { searchValue: email, limit: 30 },
          fetchPolicy: 'network-only',
          notifyOnNetworkStatusChange: true,
        }
      : undefined,
  );

  const deliveries = email
    ? list.filter(({ toEmails }) =>
        toEmails.some(
          (address) =>
            address.trim().toLowerCase() === email.trim().toLowerCase(),
        ),
      )
    : list;
  const isEmpty = email ? !deliveries.length && !hasNextPage : !totalCount;

  if (error) {
    return (
      <div role="alert" className="p-4 text-sm text-destructive">
        <p>{error.message}</p>
        <Button
          variant="outline"
          disabled={loading}
          onClick={() =>
            refetch().catch((error: Error) =>
              toast({ title: error.message, variant: 'destructive' }),
            )
          }
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <RecordTable.Provider
      columns={email ? memberColumns : emailDeliveryColumns}
      data={deliveries}
      stickyColumns={['status']}
      className="m-2"
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={list?.length}
        sessionKey={
          email
            ? `${EMAIL_DELIVERIES_CURSOR_SESSION_KEY}:${email}`
            : EMAIL_DELIVERIES_CURSOR_SESSION_KEY
        }
        loading={loading}
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

        {isEmpty && !loading && (
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
