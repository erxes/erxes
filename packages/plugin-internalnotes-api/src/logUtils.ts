import {
  putCreateLog as commonPutCreateLog,
  putUpdateLog as commonPutUpdateLog,
  putDeleteLog as commonPutDeleteLog,
  gatherNames,
  LogDesc,
  ILogDataParams,
  getSchemaLabels
} from '@erxes/api-utils/src/logUtils';

import messageBroker, {
  sendCardsMessage,
  sendContactsMessage,
  sendCoreMessage,
  sendProductsMessage
} from './messageBroker';
import {
  IInternalNoteDocument,
  internalNoteSchema
} from './models/definitions/internalNotes';
import { generateModels } from './connectionResolver';

const MODULE_NAMES = {
  DEAL: 'deal',
  PURCHASE: 'purchase',
  TICKET: 'ticket',
  TASK: 'task',
  GROWTH_HACK: 'growthHack',
  COMPANY: 'company',
  CUSTOMER: 'customer',
  PRODUCT: 'product',
  USER: 'user'
};

// used in internalNotes mutations
const findContentItemName = async (
  subdomain: string,
  contentType: string,
  contentTypeId: string
): Promise<string> => {
  let name: string = '';
  const type =
    contentType.indexOf(':') !== -1 ? contentType.split(':')[1] : contentType;

  const isCardItem =
    type === MODULE_NAMES.DEAL ||
    type === MODULE_NAMES.PURCHASE ||
    type === MODULE_NAMES.TASK ||
    type === MODULE_NAMES.TICKET ||
    type === MODULE_NAMES.GROWTH_HACK;

  if (isCardItem) {
    const cardItem = await sendCardsMessage({
      subdomain,
      action: 'findItem',
      data: {
        _id: contentTypeId,
        contentType
      },
      isRPC: true
    });

    if (cardItem && cardItem.name) {
      name = cardItem.name;
    }
  }
  if (type === MODULE_NAMES.CUSTOMER) {
    const customer = await sendContactsMessage({
      subdomain,
      action: 'customers.findOne',
      data: { _id: contentTypeId },
      isRPC: true,
      defaultValue: {}
    });

    if (customer) {
      name = await sendContactsMessage({
        subdomain,
        action: 'customers.getCustomerName',
        data: customer,
        isRPC: true,
        defaultValue: 'Unknown'
      });
    }
  }
  if (type === MODULE_NAMES.COMPANY) {
    const company = await sendContactsMessage({
      subdomain,
      action: 'companies.findOne',
      data: {
        _id: contentTypeId
      },
      isRPC: true,
      defaultValue: {}
    });

    if (company) {
      name =
        company.primaryName ||
        company.primaryEmail ||
        company.primaryPhone ||
        'Unknown';
    }
  }
  if (type === MODULE_NAMES.USER) {
    const user = await sendCoreMessage({
      subdomain,
      action: 'users.findOne',
      data: { _id: contentTypeId },
      isRPC: true,
      defaultValue: {}
    });

    if (user) {
      name = user.username || user.email || '';
    }
  }
  if (type === MODULE_NAMES.PRODUCT) {
    const product = await sendProductsMessage({
      subdomain,
      action: 'findOne',
      data: { _id: contentTypeId },
      isRPC: true,
      defaultValue: {}
    });

    if (product) {
      name = product.name;
    }
  }

  return name;
};

const gatherDescriptions = async (
  subdomain: string,
  obj: IInternalNoteDocument
) => {
  let extraDesc: LogDesc[] = [
    {
      contentTypeId: obj.contentTypeId,
      name: await findContentItemName(
        subdomain,
        obj.contentType,
        obj.contentTypeId
      )
    }
  ];

  extraDesc = await gatherNames({
    foreignKey: 'createdUserId',
    prevList: extraDesc,
    nameFields: ['email', 'username'],
    items: [
      await sendCoreMessage({
        subdomain,
        action: 'users.findOne',
        data: { _id: obj.createdUserId },
        isRPC: true,
        defaultValue: {}
      })
    ]
  });

  return extraDesc;
};

export const putDeleteLog = async (
  subdomain: string,
  logDoc: ILogDataParams,
  user
) => {
  await commonPutDeleteLog(
    subdomain,
    messageBroker(),
    {
      ...logDoc,
      extraDesc: await gatherDescriptions(subdomain, logDoc.object),
      type: `internalnotes:${logDoc.type}`
    },
    user
  );
};

export const putUpdateLog = async (
  subdomain: string,
  logDoc: ILogDataParams,
  user
) => {
  await commonPutUpdateLog(
    subdomain,
    messageBroker(),
    {
      ...logDoc,
      extraDesc: await gatherDescriptions(subdomain, logDoc.object),
      type: `internalnotes:${logDoc.type}`
    },
    user
  );
};

export const putCreateLog = async (
  subdomain: string,
  logDoc: ILogDataParams,
  user
) => {
  await commonPutCreateLog(
    subdomain,
    messageBroker(),
    {
      ...logDoc,
      extraDesc: await gatherDescriptions(subdomain, logDoc.object),
      type: `internalnotes:${logDoc.type}`
    },
    user
  );
};

export default {
  collectItems: async ({ subdomain, data }) => {
    const { contentId } = data;

    const models = await generateModels(subdomain);
    const notes = await models.InternalNotes.find({
      contentTypeId: contentId
    }).sort({ createdAt: -1 });

    for (const note of notes) {
      note.contentType = 'internalnotes:note';
    }

    return {
      status: 'success',
      data: notes
    };
  },

  getSchemaLabels: ({ data: { type } }) => ({
    status: 'success',
    data: getSchemaLabels(type, [
      { name: 'internalNote', schemas: [internalNoteSchema] }
    ])
  })
};
