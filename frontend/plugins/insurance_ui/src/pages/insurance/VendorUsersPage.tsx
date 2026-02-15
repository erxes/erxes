import { useState } from 'react';
import { PageContainer, PageSubHeader } from 'erxes-ui';
import {
  VendorUsersHeader,
  VendorUsersFilter,
  VendorUsersRecordTable,
  VendorUserForm,
} from '~/modules/insurance/components';
import { useVendorUsers } from '~/modules/insurance/hooks';
import { VendorUser } from '~/modules/insurance/types';

export const VendorUsersPage = () => {
  const [selectedVendorId, setSelectedVendorId] = useState<string>('');
  const { refetch } = useVendorUsers(selectedVendorId || undefined);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<VendorUser | undefined>();

  const handleCreate = () => {
    if (!selectedVendorId) {
      alert('Please select a vendor first');
      return;
    }
    setEditingUser(undefined);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingUser(undefined);
  };

  const handleSuccess = () => {
    refetch();
  };

  return (
    <PageContainer>
      <VendorUsersHeader
        onAddUser={handleCreate}
        canAddUser={!!selectedVendorId}
      />
      <PageSubHeader>
        <VendorUsersFilter
          selectedVendorId={selectedVendorId}
          onVendorChange={setSelectedVendorId}
        />
      </PageSubHeader>
      <VendorUsersRecordTable vendorId={selectedVendorId || undefined} />

      {selectedVendorId && (
        <VendorUserForm
          open={isFormOpen}
          onOpenChange={handleFormClose}
          vendorId={selectedVendorId}
          user={editingUser}
          onSuccess={handleSuccess}
        />
      )}
    </PageContainer>
  );
};
