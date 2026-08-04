import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('insurance');
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
            {user ? t('edit-vendor-user') : t('create-vendor-user')}
          </Dialog.Title>
        </Dialog.Header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('name')}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder={t('enter-name-optional')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              {t('email')} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder={t('enter-email')}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{t('phone')}</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder={t('enter-phone-optional')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              {t('password')} {!user && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder={
                user ? t('leave-empty-to-keep-current') : t('enter-password')
              }
              required={!user}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">{t('role')}</Label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="user">{t('user')}</option>
              <option value="admin">{t('admin')}</option>
            </select>
          </div>

          <Dialog.Footer>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('saving') : user ? t('update') : t('create')}
            </Button>
          </Dialog.Footer>
        </form>
      </Dialog.Content>
    </Dialog>
  );
};
