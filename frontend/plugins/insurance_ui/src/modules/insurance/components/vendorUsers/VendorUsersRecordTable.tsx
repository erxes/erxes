import { useMemo, useState } from 'react';
import { RecordTable } from 'erxes-ui';
import { IconUsers } from '@tabler/icons-react';
import { createVendorUsersColumns } from './VendorUsersColumns';
import { useVendorUsers } from '~/modules/insurance/hooks';
import { VendorUser } from '~/modules/insurance/types';
import { VendorUserForm } from '~/modules/insurance/components';

const VENDOR_USERS_CURSOR_SESSION_KEY = 'vendor-users-cursor';

interface VendorUsersRecordTableProps {
  vendorId?: string;
}

export const VendorUsersRecordTable = ({ vendorId }: VendorUsersRecordTableProps) => {
  const { vendorUsers, loading, refetch } = useVendorUsers(vendorId);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<VendorUser | undefined>();

  const handleEdit = (user: VendorUser) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingUser(undefined);
  };

  const handleSuccess = () => {
    refetch();
  };

  const columns = useMemo(
    () => createVendorUsersColumns(handleEdit, refetch),
    [refetch]
  );

  return (
    <>
      <RecordTable.Provider
        columns={columns}
        data={vendorUsers || []}
        className="m-3"
        stickyColumns={['more', 'checkbox', 'name']}
      >
        <RecordTable.CursorProvider
          hasPreviousPage={false}
          hasNextPage={false}
          dataLength={vendorUsers?.length}
          sessionKey={VENDOR_USERS_CURSOR_SESSION_KEY}
        >
          <RecordTable>
            <RecordTable.Header />
            <RecordTable.Body>
              {loading && <RecordTable.RowSkeleton rows={40} />}
              <RecordTable.RowList />
            </RecordTable.Body>
          </RecordTable>
          {!loading && vendorUsers?.length === 0 && (
            <div className="h-full w-full px-8 flex justify-center">
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                <div className="mb-6">
                  <IconUsers
                    size={64}
                    className="text-muted-foreground mx-auto mb-4"
                  />
                  <h3 className="text-xl font-semibold mb-2">No users yet</h3>
                  <p className="text-muted-foreground max-w-md">
                    {vendorId
                      ? 'This vendor has no users yet. Add your first user.'
                      : 'Select a vendor to view users or create new ones.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </RecordTable.CursorProvider>
      </RecordTable.Provider>

      {editingUser && (
        <VendorUserForm
          open={isFormOpen}
          onOpenChange={handleFormClose}
          vendorId={editingUser.vendor?.id || vendorId || ''}
          user={editingUser}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
};
