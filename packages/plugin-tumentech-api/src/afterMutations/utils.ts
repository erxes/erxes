import {
  sendClientPortalMessage,
  sendContactsMessage,
  sendCoreMessage,
  sendFormsMessage
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
        isMobile,
        eventData: {
          type: 'deal',
          id: deal._id
        }
      }
    });
  }
};

export const notifyConfirmationFilesAttached = async (
  subdomain: string,
  deal: any,
  oldDeal: any
) => {
  // DriverReceivedDocument
  // ShipmentComfirmation

  const docField = await sendFormsMessage({
    subdomain,
    action: 'fields.findOne',
    data: {
      query: { contentType: 'cards:deal', code: 'DriverReceivedDocument' }
    },
    isRPC: true,
    defaultValue: null
  });

  const imageField = await sendFormsMessage({
    subdomain,
    action: 'fields.findOne',
    data: {
      query: { contentType: 'cards:deal', code: 'ShipmentComfirmation' }
    },
    isRPC: true,
    defaultValue: null
  });

  if (!docField || !imageField) {
    return;
  }

  const docObj =
    deal.customFieldsData.find((f: any) => f.field === docField._id) || {};

  const imageObj =
    deal.customFieldsData.find((f: any) => f.field === imageField._id) || {};

  const oldDocObj =
    oldDeal.customFieldsData.find((f: any) => f.field === docField._id) || {};

  const oldImageObj =
    oldDeal.customFieldsData.find((f: any) => f.field === imageField._id) || {};

  if (!docObj || !imageObj || !oldDocObj || !oldImageObj) {
    return;
  }

  const docValue = docObj.value || [];
  const imageValue = imageObj.value || [];

  const oldDocValue = oldDocObj.value || [];
  const oldImageValue = oldImageObj.value || [];

  if (
    docValue.length > oldDocValue.length &&
    imageValue.length > oldImageValue.length
  ) {
    notifyDealRelatedUsers(subdomain, process.env.WEB_CP_ID || '', deal, {
      title: 'Ачилт баталгаажуулах хүсэлт',
      content: `${deal.name} aжилд ачилт баталгаажуулах хүсэлт ирлээ. Та хүсэлтийг баталгаажуулна уу?`,
      link: `/monitoring/deal?id=${deal._id}`
    });
  }
};

export const notifyUnloadConfirmationFilesAttached = async (
  subdomain: string,
  deal: any,
  oldDeal: any
) => {
  const docField = await sendFormsMessage({
    subdomain,
    action: 'fields.findOne',
    data: {
      query: { contentType: 'cards:deal', code: 'DriverSubmittedDocument' }
    },
    isRPC: true,
    defaultValue: null
  });

  const imageField = await sendFormsMessage({
    subdomain,
    action: 'fields.findOne',
    data: {
      query: { contentType: 'cards:deal', code: 'MappingDocument' }
    },
    isRPC: true,
    defaultValue: null
  });

  if (!docField || !imageField) {
    return;
  }

  const docObj =
    deal.customFieldsData.find((f: any) => f.field === docField._id) || {};

  const imageObj =
    deal.customFieldsData.find((f: any) => f.field === imageField._id) || {};

  const oldDocObj =
    oldDeal.customFieldsData.find((f: any) => f.field === docField._id) || {};

  const oldImageObj =
    oldDeal.customFieldsData.find((f: any) => f.field === imageField._id) || {};

  if (!docObj || !imageObj || !oldDocObj || !oldImageObj) {
    return;
  }

  const docValue = docObj.value || [];
  const imageValue = imageObj.value || [];

  const oldDocValue = oldDocObj.value || [];
  const oldImageValue = oldImageObj.value || [];

  if (
    docValue.length > oldDocValue.length &&
    imageValue.length > oldImageValue.length
  ) {
    notifyDealRelatedUsers(subdomain, process.env.WEB_CP_ID || '', deal, {
      title: 'Буулгалт баталгаажуулах хүсэлт',
      content: `${deal.name} aжилд буулгалт баталгаажуулах хүсэлт ирлээ. Та хүсэлтийг баталгаажуулна уу?`,
      link: `/monitoring/deal?id=${deal._id}`
    });
  }
};
