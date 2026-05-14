import { useState } from 'react';
import { Button } from 'erxes-ui';
import { IconTrash, IconEdit } from '@tabler/icons-react';
import { AddPaymentSheet } from './AddPaymentSheet';
import { type PaymentType } from '@/pos/types/types';

interface OtherPaymentProps {
  paymentTypes: PaymentType[];
  onPaymentAdded: (payment: PaymentType) => void;
  onPaymentUpdated: (payment: PaymentType) => void;
  onPaymentDeleted: (paymentId: string) => void;
}

export const OtherPayment: React.FC<OtherPaymentProps> = ({
  paymentTypes,
  onPaymentAdded,
  onPaymentUpdated,
  onPaymentDeleted,
}) => {
  const [editingPayment, setEditingPayment] = useState<PaymentType | null>(
    null,
  );

  const handleEditComplete = () => {
    setEditingPayment(null);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        type must use latin characters, some default types: golomtCard,
        khaanCard, TDBCard
        <br />
        Хэрэв тухайн төлбөрт ебаримт хэвлэхгүй бол: "skipEbarimt: true",
        Харилцагч сонгосон үед л харагдах бол: "mustCustomer: true", Хэрэв
        хуваах боломжгүй бол: "notSplit: true" Урьдчилж төлсөн төлбөрөөр (Татвар
        тооцсон) бол: "preTax: true" Хэрэв тухайн төлбөр дээр бэлдэц нэхэмжлэх
        хэвлэх бол: "printInvoice: true"
      </p>

      {paymentTypes.length > 0 && (
        <div className="space-y-2">
          {paymentTypes.map((payment) => (
            <div
              key={payment._id}
              className="flex justify-between items-center p-3 rounded-md border"
            >
              <span className="font-medium">{payment.title}</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setEditingPayment(payment)}
                >
                  <IconEdit size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onPaymentDeleted(payment._id)}
                  className="text-destructive"
                >
                  <IconTrash size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddPaymentSheet
        onPaymentAdded={onPaymentAdded}
        onPaymentUpdated={onPaymentUpdated}
        editingPayment={editingPayment}
        onEditComplete={handleEditComplete}
      />
    </div>
  );
};
