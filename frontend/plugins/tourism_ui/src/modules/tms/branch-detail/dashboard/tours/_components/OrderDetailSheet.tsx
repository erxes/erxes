'use client';

import {
  Button,
  Form,
  Input,
  Sheet,
  Spinner,
  Textarea,
  Select,
  useToast,
} from 'erxes-ui';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { useEditTourOrder, useTourOrderDetail } from '../hooks/useTourOrders';

const STATUS_OPTIONS = [
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'prepaid', label: 'Prepaid' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

type OrderFormValues = {
  status?: string;
  note?: string;
  amount?: number;
  numberOfPeople?: number;
  type?: string;
};

interface Props {
  orderId?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const OrderDetailSheet = ({ orderId, open, onOpenChange }: Props) => {
  const { toast } = useToast();
  const { order, loading } = useTourOrderDetail(orderId ?? undefined, open);
  const { editOrder, loading: saving } = useEditTourOrder();

  const form = useForm<OrderFormValues>({
    defaultValues: {
      status: 'pending',
      note: '',
      amount: 0,
      numberOfPeople: 1,
      type: '',
    },
  });

  useEffect(() => {
    if (!order || !open) return;

    if (!form.formState.isDirty) {
      form.reset({
        status: order.status ?? 'pending',
        note: order.note ?? '',
        amount: order.amount ?? 0,
        numberOfPeople: order.numberOfPeople ?? 1,
        type: order.type ?? '',
      });
    }
  }, [order, open, form]);

  const headerTitle = useMemo(() => {
    if (!orderId) return 'Order detail';
    return `Order ${orderId.slice(0, 8)}`;
  }, [orderId]);

  const handleSubmit = async (values: OrderFormValues) => {
    if (!orderId) return;

    try {
      await editOrder({
        variables: {
          id: orderId,
          order: {
            branchId: order?.branchId,
            customerId: order?.customerId,
            tourId: order?.tourId,
            additionalCustomers: order?.additionalCustomers,
            isChild: order?.isChild,
            parent: order?.parent,
            amount: values.amount ?? 0,
            status: values.status,
            note: values.note,
            numberOfPeople: values.numberOfPeople ?? 1,
            type: values.type || undefined,
          },
        },
      });

      toast({
        title: 'Success',
        description: 'Order updated successfully',
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to update order',
        variant: 'destructive',
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <Sheet.View className="w-[520px] sm:max-w-[520px] p-0">
        {loading ? (
          <div className="flex h-full min-h-[300px] items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="flex flex-col h-full"
            >
              <Sheet.Header>
                <Sheet.Title>{headerTitle}</Sheet.Title>
                <Sheet.Close />
              </Sheet.Header>

              <Sheet.Content className="overflow-y-auto flex-1 px-6 py-4">
                <div className="space-y-4">
                  <Form.Field
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Status</Form.Label>
                        <Form.Control>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <Select.Trigger>
                              {field.value
                                ? STATUS_OPTIONS.find(
                                    (option) => option.value === field.value,
                                  )?.label
                                : 'Select status'}
                            </Select.Trigger>
                            <Select.Content>
                              {STATUS_OPTIONS.map((option) => (
                                <Select.Item
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </Select.Item>
                              ))}
                            </Select.Content>
                          </Select>
                        </Form.Control>
                        <Form.Message className="text-destructive" />
                      </Form.Item>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Form.Field
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label>Amount</Form.Label>
                          <Form.Control>
                            <Input
                              type="number"
                              placeholder="0"
                              value={field.value ?? 0}
                              onChange={(event) =>
                                field.onChange(Number(event.target.value))
                              }
                            />
                          </Form.Control>
                          <Form.Message className="text-destructive" />
                        </Form.Item>
                      )}
                    />

                    <Form.Field
                      control={form.control}
                      name="numberOfPeople"
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label>People</Form.Label>
                          <Form.Control>
                            <Input
                              type="number"
                              min={1}
                              placeholder="1"
                              value={field.value ?? 1}
                              onChange={(event) =>
                                field.onChange(Number(event.target.value))
                              }
                            />
                          </Form.Control>
                          <Form.Message className="text-destructive" />
                        </Form.Item>
                      )}
                    />
                  </div>

                  <Form.Field
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Type</Form.Label>
                        <Form.Control>
                          <Input placeholder="Group" {...field} />
                        </Form.Control>
                        <Form.Message className="text-destructive" />
                      </Form.Item>
                    )}
                  />

                  <Form.Field
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Note</Form.Label>
                        <Form.Control>
                          <Textarea
                            {...field}
                            placeholder="Add note..."
                            rows={4}
                          />
                        </Form.Control>
                        <Form.Message className="text-destructive" />
                      </Form.Item>
                    )}
                  />
                </div>
              </Sheet.Content>

              <Sheet.Footer className="bg-background">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Updating...' : 'Update'}
                </Button>
              </Sheet.Footer>
            </form>
          </Form>
        )}
      </Sheet.View>
    </Sheet>
  );
};
