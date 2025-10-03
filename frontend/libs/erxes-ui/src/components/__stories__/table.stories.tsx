import { Meta } from '@storybook/react';

import type { StoryObj } from '@storybook/react';
import { Table } from 'erxes-ui/components/table';
import { Button } from 'erxes-ui/components/button';
import { Checkbox } from 'erxes-ui/components/checkbox';
import { IconDotsVertical } from '@tabler/icons-react';
import { cn } from 'erxes-ui/lib/utils';

const meta: Meta<typeof Table> = {
  title: 'Components/Table',
  component: Table,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Table>;

interface Payment {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'success' | 'failed';
  email: string;
}

const payments: Payment[] = [
  {
    id: '728ed52f',
    amount: 100,
    status: 'pending',
    email: 'user1@example.com',
  },
  {
    id: '489e1d42',
    amount: 125,
    status: 'processing',
    email: 'user2@example.com',
  },
  {
    id: 'f9d288c7',
    amount: 200,
    status: 'success',
    email: 'user3@example.com',
  },
  {
    id: 'a4a98b09',
    amount: 75,
    status: 'failed',
    email: 'user4@example.com',
  },
];

export const Default: Story = {
  render: () => (
    <div className="w-full p-1 bg-sidebar rounded-lg overflow-auto">
      <Table>
        <Table.Header className="[&_th]:w-40">
          <Table.Row>
            <Table.Head className="!w-9 text-center">
              <Checkbox />
            </Table.Head>
            <Table.Head>Invoice</Table.Head>
            <Table.Head>Status</Table.Head>
            <Table.Head>Method</Table.Head>
            <Table.Head className="text-right">Amount</Table.Head>
            <Table.Head className="!w-9"></Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {payments.map((payment, index) => (
            <Table.Row key={payment.id} className="[&>td]:w-96">
              <Table.Cell
                className={cn(
                  'px-2 text-center',
                  index === 0 && 'rounded-tl-md border-t',
                  index === payments.length - 1 && 'rounded-bl-md',
                )}
              >
                <Checkbox />
              </Table.Cell>
              <Table.Cell className={cn('px-2', index === 0 && ' border-t')}>
                {payment.id}
              </Table.Cell>
              <Table.Cell className={cn('px-2', index === 0 && ' border-t')}>
                {payment.status}
              </Table.Cell>
              <Table.Cell className={cn('px-2', index === 0 && ' border-t')}>
                {payment.email}
              </Table.Cell>
              <Table.Cell className={cn('px-2', index === 0 && ' border-t')}>
                ${payment.amount.toFixed(2)}
              </Table.Cell>
              <Table.Cell
                className={cn(
                  'px-1 w-9 text-center',
                  index === 0 && 'rounded-tr-md border-t',
                  index === payments.length - 1 && 'rounded-br-md',
                )}
              >
                <Button variant="ghost" size="icon">
                  <IconDotsVertical className="h-4 w-4" />
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div className="w-full bg-sidebar p-1 rounded-lg">
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Invoice</Table.Head>
            <Table.Head>Status</Table.Head>
            <Table.Head>Method</Table.Head>
            <Table.Head className="text-right">Amount</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell
              colSpan={4}
              className="h-24 text-center border-t rounded-md"
            >
              No results found.
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    </div>
  ),
};
