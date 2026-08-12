import { emailAddressColumns } from '@/settings/email-addresses/components/emailAddressColumns';
import { EMAIL_ADDRESSES_CURSOR_SESSION_KEY } from '@/settings/email-addresses/constants';
import { useEmailAddresses } from '@/settings/email-addresses/hooks/useEmailAddresses';
import { IconAddressBook } from '@tabler/icons-react';
import { RecordTable } from 'erxes-ui';

export const EmailAddressesRecordTable = () => {
  const {
    list,
    loading,
    totalCount,
    handleFetchMore,
    hasNextPage,
    hasPreviousPage,
  } = useEmailAddresses();

  return (
    <RecordTable.Provider
      columns={emailAddressColumns}
      data={list}
      stickyColumns={['lane']}
      className="m-2"
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={list?.length}
        sessionKey={EMAIL_ADDRESSES_CURSOR_SESSION_KEY}
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
                <IconAddressBook
                  size={64}
                  className="mx-auto mb-4 text-muted-foreground"
                />
                <h3 className="mb-2 text-xl font-semibold">
                  Nothing learned yet
                </h3>
                <p className="max-w-md text-muted-foreground">
                  Every address erxes mails appears here once the provider says
                  what happened to it — delivered, bounced or reported as spam.
                </p>
              </div>
            </div>
          </div>
        )}
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};
