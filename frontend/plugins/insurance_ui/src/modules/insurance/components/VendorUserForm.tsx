import { useState, useEffect } from 'react';
import { Dialog, Button, Input, Label } from 'erxes-ui';
import {
  useCreateVendorUser,
  useUpdateVendorUser,
} from '~/modules/insurance/hooks';
import { VendorUser } from '~/modules/insurance/types';

interface VendorUserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendorId: string;
  user?: VendorUser;
  onSuccess?: () => void;
}

export const VendorUserForm = ({
  open,
  onOpenChange,
  vendorId,
  user,
  onSuccess,
}: VendorUserFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'user',
  });

  const { createVendorUser, loading: creating } = useCreateVendorUser();
  const { updateVendorUser, loading: updating } = useUpdateVendorUser();

  const loading = creating || updating;

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email,
        phone: user.phone || '',
        password: '',
        role: user.role,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'user',
      });
    }
  }, [user, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (user) {
        // Update
        const updateData: any = {
          id: user.id,
          name: formData.name || undefined,
          email: formData.email,
          phone: formData.phone || undefined,
          role: formData.role,
        };

        if (formData.password) {
          updateData.password = formData.password;
        }

        await updateVendorUser(updateData);
      } else {
        // Create
        await createVendorUser({
          name: formData.name || undefined,
          email: formData.email,
          phone: formData.phone || undefined,
          password: formData.password,
          vendorId,
          role: formData.role,
        });
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving vendor user:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-md">
        <Dialog.Header>
          <Dialog.Title>
            {user ? 'Edit Vendor User' : 'Create Vendor User'}
          </Dialog.Title>
        </Dialog.Header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter name (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="Enter email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="Enter phone (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Password {!user && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder={
                user ? 'Leave empty to keep current' : 'Enter password'
              }
              required={!user}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <Dialog.Footer>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : user ? 'Update' : 'Create'}
            </Button>
          </Dialog.Footer>
        </form>
      </Dialog.Content>
    </Dialog>
  );
};
