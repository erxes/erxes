import { useState, useEffect } from 'react';
import { Button, Label, Input, Select, Sheet } from 'erxes-ui';
import { IconPlus } from '@tabler/icons-react';
import PaymentIcon from '../../constants';
import { PaymentType } from '@/pos/types/types';

interface AddPaymentSheetProps {
  onPaymentAdded?: (payment: PaymentType) => void;
  onPaymentUpdated?: (payment: PaymentType) => void;
  editingPayment?: PaymentType | null;
  onEditComplete?: () => void;
}

const ICON_OPTIONS = [
  { value: 'credit-card', label: 'Credit Card' },
  { value: 'cash', label: 'Cash' },
  { value: 'bank', label: 'Bank' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'visa', label: 'Visa' },
  { value: 'mastercard', label: 'Mastercard' },
  { value: 'sign-alt', label: 'Sign Alt' },
];

export const AddPaymentSheet: React.FC<AddPaymentSheetProps> = ({
  onPaymentAdded,
  onPaymentUpdated,
  editingPayment,
  onEditComplete,
}) => {
  const [open, setOpen] = useState(false);
  const [formType, setFormType] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formIcon, setFormIcon] = useState('');
  const [formConfig, setFormConfig] = useState('');

  const generateId = () => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  };

  useEffect(() => {
    if (editingPayment) {
      setOpen(true);
      setFormType(editingPayment.type);
      setFormTitle(editingPayment.title);
      setFormIcon(editingPayment.icon);
      setFormConfig(editingPayment.config || '');
    }
  }, [editingPayment]);

  const resetForm = () => {
    setFormType('');
    setFormTitle('');
    setFormIcon('');
    setFormConfig('');
  };

  const handleCancel = () => {
    setOpen(false);
    resetForm();
    onEditComplete?.();
  };

  const handleSubmit = () => {
    const payment: PaymentType = {
      _id: editingPayment?._id || generateId(),
      type: formType,
      title: formTitle,
      icon: formIcon,
      config: formConfig,
    };

    if (editingPayment) {
      onPaymentUpdated?.(payment);
    } else {
      onPaymentAdded?.(payment);
    }

    setOpen(false);
    resetForm();
    onEditComplete?.();
  };

  const isEditing = !!editingPayment;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {!isEditing && (
        <Sheet.Trigger asChild>
          <Button variant="outline">
            <IconPlus size={16} className="mr-2" />
            Add payment
          </Button>
        </Sheet.Trigger>
      )}
      <Sheet.View className="p-0 sm:max-w-lg">
        <Sheet.Header>
          <Sheet.Title>
            {isEditing ? 'Edit Payment' : 'Add Payment'}
          </Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>

        <Sheet.Content className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>
              TYPE <span className="text-destructive">*</span>
            </Label>
            <Input
              value={formType}
              onChange={(e) => setFormType(e.target.value)}
              placeholder="e.g. golomtCard, khaanCard"
            />
          </div>

          <div className="space-y-2">
            <Label>
              TITLE <span className="text-destructive">*</span>
            </Label>
            <Input
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Payment title"
            />
          </div>

          <div className="space-y-2">
            <Label>ICON</Label>
            <Select value={formIcon} onValueChange={setFormIcon}>
              <Select.Trigger className="w-full">
                <Select.Value placeholder="Select icon" />
              </Select.Trigger>
              <Select.Content>
                {ICON_OPTIONS.map((opt) => (
                  <Select.Item key={opt.value} value={opt.value}>
                    <div className="flex gap-2 items-center">
                      <PaymentIcon iconType={opt.value} size={16} />
                      {opt.label}
                    </div>
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>CONFIG</Label>
            <Input
              value={formConfig}
              onChange={(e) => setFormConfig(e.target.value)}
              placeholder="e.g. skipEbarimt: true"
            />
          </div>
        </Sheet.Content>

        <Sheet.Footer className="bg-background">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!formType || !formTitle}>
            {isEditing ? 'Update' : 'Add'}
          </Button>
        </Sheet.Footer>
      </Sheet.View>
    </Sheet>
  );
};
