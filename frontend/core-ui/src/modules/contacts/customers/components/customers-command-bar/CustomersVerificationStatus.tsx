import { useChangeVerificationStatus } from '@/contacts/customers/hooks/useChangeVerificationStatus';
import { Button, DropdownMenu, useToast } from 'erxes-ui';
import { IconShieldCheck } from '@tabler/icons-react';
import { ApolloError } from '@apollo/client';
import { Row } from '@tanstack/table-core';
import { ICustomer } from 'ui-modules';

const EMAIL_VALIDATION_STATUSES = [
  { label: 'Valid', value: 'valid' },
  { label: 'Invalid', value: 'invalid' },
  { label: 'Accept all unverifiable', value: 'accept_all_unverifiable' },
  { label: 'Unknown', value: 'unknown' },
  { label: 'Disposable', value: 'disposable' },
  { label: 'Catch all', value: 'catchall' },
  { label: 'Bad syntax', value: 'bad_syntax' },
  { label: 'Not checked', value: 'not_checked' },
];

export const CustomersVerificationStatus = ({
  customerIds,
  rows,
}: {
  customerIds: string[];
  rows: Row<ICustomer>[];
}) => {
  const { changeVerificationStatus } = useChangeVerificationStatus();
  const { toast } = useToast();

  const currentStatus =
    rows.length === 1 ? rows[0].original.emailValidationStatus : undefined;

  const handleSelect = async (status: string) => {
    await changeVerificationStatus(customerIds, status, {
      onError: (e: ApolloError) => {
        toast({
          title: 'Error',
          description: e.message,
          variant: 'destructive',
        });
      },
      onCompleted: () => {
        rows.forEach((row) => row.toggleSelected(false));
        toast({
          title: 'Success',
          variant: 'success',
          description: 'Verification status updated successfully',
        });
      },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="secondary">
          <IconShieldCheck />
          Verify
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        {EMAIL_VALIDATION_STATUSES.map((status) => (
          <DropdownMenu.Item
            key={status.value}
            onSelect={() => handleSelect(status.value)}
            className={
              currentStatus === status.value ? 'bg-primary/10 font-medium' : ''
            }
          >
            {status.label}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
