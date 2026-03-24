import { useState, useEffect } from 'react';
import { Dialog, Button, Label, Input } from 'erxes-ui';
import { useCreateVendor, useUpdateVendor } from '../hooks';
import { InsuranceVendor } from '../types';

interface VendorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor?: InsuranceVendor;
  onSuccess?: () => void;
}

export const VendorForm = ({
  open,
  onOpenChange,
  vendor,
  onSuccess,
}: VendorFormProps) => {
  const { createVendor, loading: creating } = useCreateVendor();
  const { updateVendor, loading: updating } = useUpdateVendor();

  const [name, setName] = useState('');

  useEffect(() => {
    if (vendor) {
      setName(vendor.name);
    } else {
      setName('');
    }
  }, [vendor, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (vendor) {
        await updateVendor({
          variables: {
            id: vendor.id,
            name,
          },
        });
      } else {
        await createVendor({
          variables: {
            name,
          },
        });
      }

      setName('');
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error saving vendor:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-md">
        <Dialog.Header>
          <Dialog.Title>
            {vendor ? 'Edit Vendor' : 'Create New Vendor'}
          </Dialog.Title>
        </Dialog.Header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Vendor Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., ABC Insurance Company"
              required
            />
          </div>

          <Dialog.Footer>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={creating || updating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={creating || updating}>
              {creating || updating
                ? 'Saving...'
                : vendor
                ? 'Update'
                : 'Create'}
            </Button>
          </Dialog.Footer>
        </form>
      </Dialog.Content>
    </Dialog>
  );
};
