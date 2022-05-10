import { sendContactsMessage, sendCoreMessage } from '../messageBroker';

/*
 * Handle engage unsubscribe request
 */
export const handleUnsubscription = async (
  subdomain: string,
  query: {
    cid: string;
    uid: string;
  }
) => {
  const { cid, uid } = query;

  if (cid) {
    await sendContactsMessage({
      subdomain,
      action: 'customers.updateOne',
      data: {
        selector: {
          _id: cid
        },
        modifier: {
          $set: { isSubscribed: 'No' }
        }
      },
      isRPC: true,
      defaultValue: {}
    });
  }

  if (uid) {
    await sendCoreMessage({
      subdomain,
      action: 'users.updateOne',
      data: {
        selector: {
          _id: uid
        },
        modifier: {
          $set: { isSubscribed: 'No' }
        }
      },
      isRPC: true
    });
  }
};
