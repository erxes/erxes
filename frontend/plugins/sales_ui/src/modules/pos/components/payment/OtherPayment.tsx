import { useEffect, useState } from 'react';
import { Button, toast } from 'erxes-ui';
import { IconTrash, IconEdit } from '@tabler/icons-react';
import { useMutation } from '@apollo/client';
import { usePosDetail } from '../../hooks/usePosDetail';
import mutations from '../../graphql/mutations';
import { AddPaymentSheet } from './AddPaymentSheet';
import { PaymentType } from '@/pos/types/types';

interface OtherPaymentProps {
  posId?: string;
}

export const OtherPayment: React.FC<OtherPaymentProps> = ({ posId }) => {
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentType | null>(
    null,
  );

  const { posDetail, loading: detailLoading } = usePosDetail(posId);
  const [posEdit, { loading: saving }] = useMutation(mutations.posEdit);

  useEffect(() => {
    if (posDetail?.paymentTypes) {
      const validPaymentTypes = posDetail.paymentTypes
        .filter((p): p is PaymentType => !!p._id)
        .map((p) => ({
          _id: p._id,
          type: p.type,
          title: p.title,
          icon: p.icon,
          config: p.config,
        }));
      setPaymentTypes(validPaymentTypes);
      setHasChanges(false);
    }
  }, [posDetail]);

  const handlePaymentAdded = (payment: PaymentType) => {
    setPaymentTypes([...paymentTypes, payment]);
    setHasChanges(true);
  };

  const handlePaymentUpdated = (payment: PaymentType) => {
    setPaymentTypes(
      paymentTypes.map((p) => (p._id === payment._id ? payment : p)),
    );
    setHasChanges(true);
  };

  const handleEditComplete = () => {
    setEditingPayment(null);
  };

  const handleDeletePayment = (id: string) => {
    setPaymentTypes(paymentTypes.filter((p) => p._id !== id));
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    if (!posId) {
      toast({
        title: 'Error',
        description: 'POS ID is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      await posEdit({
        variables: {
          _id: posId,
          paymentTypes: paymentTypes.map(
            ({ _id, type, title, icon, config }) => ({
              _id,
              type,
              title,
              icon,
              config,
            }),
          ),
        },
      });

      toast({
        title: 'Success',
        description: 'Payment types saved successfully',
      });
      setHasChanges(false);
    } catch (err) {
      console.error('Error saving payment types:', err);
      toast({
        title: 'Error',
        description: 'Failed to save payment types',
        variant: 'destructive',
      });
    }
  };

  if (detailLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 rounded animate-pulse bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        type is must latin, some default types: golomtCard, khaanCard, TDBCard
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
                  onClick={() => handleDeletePayment(payment._id)}
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
        onPaymentAdded={handlePaymentAdded}
        onPaymentUpdated={handlePaymentUpdated}
        editingPayment={editingPayment}
        onEditComplete={handleEditComplete}
      />

      {hasChanges && (
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSaveChanges} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </div>
  );
};
