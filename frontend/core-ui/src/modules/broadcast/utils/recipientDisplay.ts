import { TBroadcastRecipient } from '../types';

/** The manifest holds an id; the name comes from the contact it points at. */
export const recipientDisplayName = (recipient: TBroadcastRecipient) => {
  const { customer, customerId } = recipient;
  const name = [customer?.firstName, customer?.lastName]
    .filter(Boolean)
    .join(' ');

  return name || customer?.primaryEmail || customer?.primaryPhone || customerId;
};

/** The last time anything happened to the recipient. */
export const recipientUpdatedAt = ({
  updatedAt,
  finishedAt,
  createdAt,
}: TBroadcastRecipient) => updatedAt || finishedAt || createdAt;
