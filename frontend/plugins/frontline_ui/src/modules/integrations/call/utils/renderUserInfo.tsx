import { ICustomer } from '@/integrations/call/types/callTypes';
import type { CallsCustomerDetailQuery } from '~/gql/graphql';

export const renderUserInfo = (
  customer: Partial<ICustomer> | null | undefined,
  customerDetail: CallsCustomerDetailQuery['callsCustomerDetail'] | undefined,
  phoneNumber?: string,
) => {
  if (!customer) {
    return (
      <div className="text-center">
        <div className="text-accent-foreground">
          {phoneNumber ? phoneNumber : 'Unknown caller'}{' '}
        </div>
      </div>
    );
  }

  const displayName =
    customer?.firstName || customer?.lastName
      ? `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim()
      : customer?.primaryPhone ||
        customerDetail?.firstName ||
        customerDetail?.lastName
      ? `${customerDetail?.firstName || ''} ${
          customerDetail?.lastName || ''
        }`.trim()
      : customerDetail?.primaryPhone || phoneNumber
      ? phoneNumber
      : 'Unknown';

  return (
    <div className="text-center space-y-1">
      <div className="font-semibold text-foreground text-lg">{displayName}</div>
      {customer.primaryPhone && displayName !== customer.primaryPhone && (
        <div className="text-accent-foreground text-sm">
          {customer?.primaryPhone}
        </div>
      )}

      {!customerDetail && customer.primaryEmail && (
        <div className="text-accent-foreground text-sm">
          {customer.primaryEmail}
        </div>
      )}
    </div>
  );
};
