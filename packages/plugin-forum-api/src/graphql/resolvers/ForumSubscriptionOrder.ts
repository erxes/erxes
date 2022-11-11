import { contentType } from '../../db/models/subscription/subscriptionOrder';

const ForumSubscriptionOrder = {
  contentType: () => contentType,
  invoice: ({ invoiceId }) => {
    return invoiceId && { __typename: 'Invoice', _id: invoiceId };
  }
};

export default ForumSubscriptionOrder;
