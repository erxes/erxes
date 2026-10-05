import { sendTRPCMessage } from 'erxes-api-shared/utils';

export const assertCustomerRecipient = async (
  subdomain: string,
  customerId: string,
  email: string,
) => {
  const customer: unknown = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'customers',
    action: 'findOne',
    input: { _id: customerId },
    defaultValue: null,
    throwOnError: true,
  });
  const recipient = email.trim().toLowerCase();
  const addresses =
    customer && typeof customer === 'object'
      ? [
          'primaryEmail' in customer ? customer.primaryEmail : null,
          ...('emails' in customer && Array.isArray(customer.emails)
            ? customer.emails
            : []),
        ]
      : [];

  if (
    !addresses.some(
      (address) =>
        typeof address === 'string' &&
        address.trim().toLowerCase() === recipient,
    )
  ) {
    throw new Error('Recipient does not belong to the selected customer');
  }
};
