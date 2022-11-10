import {
  sendClientPortalMessage,
  sendContactsMessage,
  sendCoreMessage
} from '../messageBroker';

interface INotificationParams {
  title: string;
  content: string;
  link?: string;
  isMobile?: boolean;
}

export const notifyDealRelatedUsers = async (
  subdomain: string,
  clientPortalId: string,
  deal: any,
  notification: INotificationParams
) => {
  const { title, content, link, isMobile } = notification;

  const conformities = await sendCoreMessage({
    subdomain,
    action: 'conformities.getConformities',
    data: {
      mainType: 'deal',
      mainTypeIds: [deal._id],
      relTypes: ['customer']
    },
    isRPC: true,
    defaultValue: []
  });

  if (conformities.length === 0) {
    return;
  }

  for (const c of conformities) {
    const customer = await sendContactsMessage({
      subdomain,
      action: 'customers.findOne',
      data: {
        _id: c.relTypeId
      },
      isRPC: true,
      defaultValue: null
    });

    if (!customer) {
      continue;
    }

    const cpUser = await sendClientPortalMessage({
      subdomain,
      action: 'clientPortalUsers.findOne',
      data: {
        erxesCustomerId: customer._id,
        clientPortalId
      },
      isRPC: true,
      defaultValue: null
    });

    if (!cpUser) {
      continue;
    }

    sendClientPortalMessage({
      subdomain,
      action: 'sendNotification',
      data: {
        title,
        content,
        receivers: [cpUser._id],
        notifType: 'system',
        link,
        isMobile
      }
    });
  }
};
