import { useMutation, useQuery } from '@apollo/client';
import {
  IconCurrencyDollar,
  IconPlus,
  IconSettings
} from '@tabler/icons-react';
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

  const confirmOptions = { confirmationValue: 'delete' };
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<IPaymentDocument | null>(
    null,
  );
  const [payments, setPayments] = useState<IPaymentDocument[]>(
    data?.payments || [],
  );

  const [addPayment] = useMutation(ADD_PAYMENT);
  const [editPayment] = useMutation(EDIT_PAYMENT);
  const [removePayment] = useMutation(REMOVE_PAYMENT);

  const handleAddPayment = () => {
    setEditingPayment(null);
    setSheetOpen(true);
  };

  const handleEditPayment = (payment: IPaymentDocument) => {
    setEditingPayment(payment);
    setSheetOpen(true);
  };

  const handleDeletePayment = (id: string) => {
    confirm({
      message: 'Are you sure you want to delete this payment method?',
      options: confirmOptions,
    }).then(async () => {
      removePayment({
        variables: {
          _id: id,
        },
      })
        .then(() => {
          toast({
            title: 'Success',
            description: 'Payment method deleted successfully',
          });
          setPayments((prev) => prev.filter((p) => p._id !== id));
        })
        .catch((e) => {
          toast({
            title: 'Error',
            description: e.message,
          });
        });
    });
  };

  const handleSavePayment = (formData: IPayment) => {
    if (editingPayment) {
      // Update existing payment
      editPayment({
        variables: {
          _id: editingPayment._id,
          input: formData,
        },
      })
        .then(() => {
          toast({
            title: 'Success',
            description: 'Payment method updated successfully',
          });
          setPayments((prev) =>
            prev.map((p) =>
              p._id === editingPayment._id
                ? {
                    ...p,
                    ...formData,
                    credentials: `****${Math.random().toString().slice(-4)}`,
                  }
                : p,
            ),
          );
        })
        .catch((e) => {
          toast({
            title: 'Error',
            description: e.message,
          });
        });
    } else {
      // Add new payment
      addPayment({
        variables: {
          input: formData,
        },
      })
        .then(() => {
          toast({
            title: 'Success',
            description: 'Payment method added successfully',
          });
          const newPayment = {
            ...formData,
            credentials: `****${Math.random().toString().slice(-4)}`,
            createdAt: new Date().toISOString().split('T')[0],
          };
          setPayments((prev) => [...prev, newPayment] as IPaymentDocument[]);
        })
        .catch((e) => {
          toast({
            title: 'Error',
            description: e.message,
          });
        });
    }
    setSheetOpen(false);
    setEditingPayment(null);
  };

  useEffect(() => {
    if (data) {
      setPayments(data.payments);
    }
  }, [data]);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/payment">
                    <IconCurrencyDollar />
                    Invoices
                  </Link>
                </Button>
              </Breadcrumb.Item>
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PaymentTable
          payments={payments}
          onEdit={handleEditPayment}
          onDelete={handleDeletePayment}
        />
      </div>

      {/* Sheet */}
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
