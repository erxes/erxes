import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { Dialog, Button, Label, Input, Select } from 'erxes-ui';
import { useCreateCustomer, useUpdateCustomer } from '../hooks';
import { InsuranceCustomer, CustomerType } from '../types';

interface CustomerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: InsuranceCustomer;
  onSuccess?: () => void;
}

export const CustomerForm = ({
  open,
  onOpenChange,
  customer,
  onSuccess,
}: CustomerFormProps) => {
  const { t } = useTranslation('insurance');
  const { createCustomer, loading: creating } = useCreateCustomer();
  const { updateCustomer, loading: updating } = useUpdateCustomer();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    type: 'individual' as CustomerType,
    registrationNumber: '',
    email: '',
    phone: '',
    companyName: '',
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        firstName: customer.firstName,
        lastName: customer.lastName,
        type: customer.type,
        registrationNumber: customer.registrationNumber,
        email: customer.email || '',
        phone: customer.phone || '',
        companyName: customer.companyName || '',
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        type: 'individual' as CustomerType,
        registrationNumber: '',
        email: '',
        phone: '',
        companyName: '',
      });
    }
  }, [customer, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const input = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        type: formData.type,
        registrationNumber: formData.registrationNumber,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        companyName:
          formData.type === 'company' ? formData.companyName : undefined,
      };

      if (customer) {
        await updateCustomer({
          variables: {
            id: customer.id,
            input,
          },
        });
      } else {
        await createCustomer({
          variables: {
            input,
          },
        });
      }

      setFormData({
        firstName: '',
        lastName: '',
        type: 'individual' as CustomerType,
        registrationNumber: '',
        email: '',
        phone: '',
        companyName: '',
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error saving customer:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-lg">
        <Dialog.Header>
          <Dialog.Title>
            {customer ? t('edit-customer', 'Edit Customer') : t('new-customer', 'New Customer')}
          </Dialog.Title>
        </Dialog.Header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">{t('type-required', 'Type *')}</Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value as CustomerType })
              }
            >
              <Select.Trigger>
                <Select.Value placeholder={t('select-type', 'Select type')} />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="individual">{t('individual', 'Individual')}</Select.Item>
                <Select.Item value="company">{t('company', 'Company')}</Select.Item>
              </Select.Content>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lastName">{t('last-name-required', 'Last Name *')}</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                placeholder={t('last-name', 'Last name')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="firstName">{t('first-name-required', 'First Name *')}</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                placeholder={t('first-name', 'First name')}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="registrationNumber">{t('registration-number-required', 'Registration Number *')}</Label>
            <Input
              id="registrationNumber"
              value={formData.registrationNumber}
              onChange={(e) =>
                setFormData({ ...formData, registrationNumber: e.target.value })
              }
              placeholder="AA00000000"
              required
            />
          </div>

          {formData.type === 'company' && (
            <div className="space-y-2">
              <Label htmlFor="companyName">{t('company-name', 'Company Name')}</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
                placeholder={t('company-name-placeholder', 'Company name')}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('email', 'Email')}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder={t('email-placeholder', 'email@example.com')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t('phone', 'Phone')}</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder={t('phone-placeholder', '99001122')}
              />
            </div>
          </div>

          <Dialog.Footer>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={creating || updating}
            >
              {t('cancel', 'Cancel')}
            </Button>
            <Button type="submit" disabled={creating || updating}>
              {creating || updating
                ? t('saving', 'Saving...')
                : customer
                  ? t('update', 'Update')
                  : t('create', 'Create')}
            </Button>
          </Dialog.Footer>
        </form>
      </Dialog.Content>
    </Dialog>
  );
};
