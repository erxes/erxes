import { IconCreditCard, IconEdit, IconTrash } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { Button, REACT_APP_API_URL, Table } from 'erxes-ui';
import { IPaymentDocument } from '~/modules/payment/types/Payment';
import { paymentKind } from '~/modules/payment/utils';

type Props = {
  payments: IPaymentDocument[];
  onEdit: (payment: IPaymentDocument) => void;
  onDelete: (id: string) => void;
};

const PaymentTable = ({ payments, onEdit, onDelete }: Props) => {
  return (
    <div className="bg-white rounded-lg border">
      <div className="overflow-x-auto">
        <Table className="w-full">
          <Table.Header>
            <Table.Row>
              <Table.Head>Payment Method</Table.Head>
              <Table.Head>Name</Table.Head>
              <Table.Head>Credentials</Table.Head>
              <Table.Head>Created</Table.Head>
              <Table.Head>Actions</Table.Head>
            </Table.Row>
          </Table.Header>
          <tbody className="divide-y divide-gray-200">
            {payments.map((payment) => {
              return (
                <Table.Row key={payment._id} className="hover:bg-gray-50">
                  <Table.Cell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full text-white">
                        <img
                          className="w-6 h-6 object-contain rounded-md"
                          src={`${REACT_APP_API_URL}/pl:payment/static/images/payments/${payment.kind}.png`}
                          alt={paymentKind(payment.kind)?.name}
                        />
                      </div>
                      <span className="font-medium text-gray-900">
                        {paymentKind(payment.kind)?.name}
                      </span>
                    </div>
                  </Table.Cell>
                  <Table.Cell className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {payment.name}
                  </Table.Cell>
                  <Table.Cell className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {'******'}
                  </Table.Cell>
                  <Table.Cell className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {dayjs(payment.createdAt).format('YYYY-MM-DD')}
                  </Table.Cell>
                  <Table.Cell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(payment)}
                      >
                        <IconEdit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(payment._id)}
                      >
                        <IconTrash className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </tbody>
        </Table>
      </div>
      {payments.length === 0 && (
        <div className="text-center py-12">
          <IconCreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No payment methods configured</p>
        </div>
      )}
    </div>
  );
};

export default PaymentTable;
