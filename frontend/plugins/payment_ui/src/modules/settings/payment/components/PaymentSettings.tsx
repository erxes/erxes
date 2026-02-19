import { useMutation, useQuery } from '@apollo/client';
import { IconPlus, IconSettings } from '@tabler/icons-react';
import { Breadcrumb, Button, Sheet, useConfirm, useToast } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from 'ui-modules';

import PaymentForm from '~/modules/settings/payment/components/PaymentForm';
import PaymentTable from '~/modules/settings/payment/components/PaymentTable';

import {
  ADD_PAYMENT,
  EDIT_PAYMENT,
  REMOVE_PAYMENT,
} from '~/modules/payment/graphql/mutations';
import { PAYMENTS } from '~/modules/payment/graphql/queries';
import { IPayment, IPaymentDocument } from '~/modules/payment/types/Payment';

const PaymentModule = () => {
  const { data } = useQuery(PAYMENTS);
  const { toast } = useToast();
  const { confirm } = useConfirm();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingPayment, setEditingPayment] =
    useState<IPaymentDocument | null>(null);
  const [payments, setPayments] = useState<IPaymentDocument[]>([]);

  const [addPayment] = useMutation(ADD_PAYMENT);
  const [editPayment] = useMutation(EDIT_PAYMENT);
  const [removePayment] = useMutation(REMOVE_PAYMENT);

  useEffect(() => {
    if (data?.payments) {
      setPayments(data.payments);
    }
  }, [data]);

  const handleAddPayment = () => {
    setEditingPayment(null);
    setSheetOpen(true);
  };

  const handleEditPayment = (payment: IPaymentDocument) => {
    setEditingPayment(payment);
    setSheetOpen(true);
  };

  const handleDeletePayment = async (id: string) => {
    const confirmed = await confirm({
      message: 'Are you sure you want to delete this payment method?',
      options: { confirmationValue: 'delete' },
    });

    if (!confirmed) return;

    try {
      await removePayment({ variables: { _id: id } });

      toast({
        title: 'Success',
        description: 'Payment method deleted successfully',
      });

      setPayments((prev) => prev.filter((p) => p._id !== id));
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e.message,
      });
    }
  };

  const handleSavePayment = async (formData: IPayment) => {
    try {
      if (editingPayment) {
        await editPayment({
          variables: {
            _id: editingPayment._id,
            input: formData,
          },
        });

        toast({
          title: 'Success',
          description: 'Payment method updated successfully',
        });

        setPayments((prev) =>
          prev.map((p) =>
            p._id === editingPayment._id
              ? { ...p, ...formData }
              : p,
          ),
        );
      } else {
        const { data } = await addPayment({
          variables: { input: formData },
        });

        toast({
          title: 'Success',
          description: 'Payment method added successfully',
        });

        if (data?.addPayment) {
          setPayments((prev) => [...prev, data.addPayment]);
        }
      }

      setSheetOpen(false);
      setEditingPayment(null);
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e.message,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/settings/payment">
                    <IconSettings />
                    Payment Settings
                  </Link>
                </Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
        </PageHeader.Start>

        <PageHeader.End>
          <Button onClick={handleAddPayment}>
            <IconPlus className="w-4 h-4 mr-2" />
            Add Payment
          </Button>
        </PageHeader.End>
      </PageHeader>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PaymentTable
          payments={payments}
          onEdit={handleEditPayment}
          onDelete={handleDeletePayment}
        />
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <Sheet.View>
          <Sheet.Header>
            <Sheet.Title>
              {editingPayment ? 'Edit Payment Method' : 'Add Payment Method'}
            </Sheet.Title>
          </Sheet.Header>
          <Sheet.Content>
            <PaymentForm
              payment={editingPayment}
              onSave={handleSavePayment}
              onCancel={() => setSheetOpen(false)}
            />
          </Sheet.Content>
        </Sheet.View>
      </Sheet>
    </div>
  );
};

export default PaymentModule;
