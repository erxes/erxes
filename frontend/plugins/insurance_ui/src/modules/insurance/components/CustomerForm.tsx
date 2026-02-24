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
            {customer ? 'Харилцагч засах' : 'Шинэ харилцагч'}
          </Dialog.Title>
        </Dialog.Header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Төрөл *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value as CustomerType })
              }
            >
              <Select.Trigger>
                <Select.Value placeholder="Төрөл сонгох" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="individual">Хувь хүн</Select.Item>
                <Select.Item value="company">Байгууллага</Select.Item>
              </Select.Content>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Овог *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                placeholder="Овог"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Нэр *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                placeholder="Нэр"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="registrationNumber">Регистрийн дугаар *</Label>
            <Input
              id="registrationNumber"
              value={formData.registrationNumber}
              onChange={(e) =>
                setFormData({ ...formData, registrationNumber: e.target.value })
              }
              placeholder="АА00000000"
              required
            />
          </div>

          {formData.type === 'company' && (
            <div className="space-y-2">
              <Label htmlFor="companyName">Байгууллагын нэр</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
                placeholder="Байгууллагын нэр"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Имэйл</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Утас</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="99001122"
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
              Цуцлах
            </Button>
            <Button type="submit" disabled={creating || updating}>
              {creating || updating
                ? 'Хадгалж байна...'
                : customer
                  ? 'Шинэчлэх'
                  : 'Үүсгэх'}
            </Button>
          </Dialog.Footer>
        </form>
      </Dialog.Content>
    </Dialog>
  );
};
