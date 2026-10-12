import { EmptyState } from '@/settings/components/EmptyState';
import { EmailDeliveryDetailSheet } from '@/settings/email-deliveries/components/EmailDeliveryDetailSheet';
import { emailDeliveryColumns } from '@/settings/email-deliveries/components/emailDeliveryColumns';
import { EMAIL_DELIVERIES_CURSOR_SESSION_KEY } from '@/settings/email-deliveries/constants';
import { useEmailDeliveries } from '@/settings/email-deliveries/hooks/useEmailDeliveries';
import { IconMailOff } from '@tabler/icons-react';
import { Button, RecordTable, toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

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

  const { t } = useTranslation('settings', { keyPrefix: 'email-deliveries' });
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
          <EmptyState
            icon={IconMailOff}
            title={t('no-email-deliveries-found')}
            description={t('email-deliveries-description')}
          />
        )}
      </RecordTable.CursorProvider>

      <EmailDeliveryDetailSheet />
    </RecordTable.Provider>
  );
};
