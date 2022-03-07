import { gatherNames, LogDesc, ILogDataParams } from '@erxes/api-utils/src/logUtils';

import {
  putCreateLog as commonPutCreateLog,
  putUpdateLog as commonPutUpdateLog,
  putDeleteLog as commonPutDeleteLog,
} from '@erxes/api-utils/src/logUtils';

import messageBroker, { findItem } from './messageBroker';
import { IInternalNoteDocument } from './models/definitions/internalNotes';

const MODULE_NAMES = {
  DEAL: 'deal',
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
  contentType: string,
  contentTypeId: string
): Promise<string> => {
  let name: string = '';
  const type = contentType.indexOf(':') !== -1 ? contentType.split(':')[1] : contentType;

  const isCardItem =
    type === MODULE_NAMES.DEAL ||
    type === MODULE_NAMES.TASK ||
    type === MODULE_NAMES.TICKET ||
    type === MODULE_NAMES.GROWTH_HACK;

  if (isCardItem) {
    const cardItem = await findItem({ _id: contentTypeId, contentType });

    if (cardItem && cardItem.name) {
      name = cardItem.name;
    }
  }
  if (contentType === MODULE_NAMES.CUSTOMER) {
    const customer = await messageBroker().sendRPCMessage(
      'contacts:rpc_queue:findCustomer',
      { _id: contentTypeId }
    );

    if (customer) {
      name = await messageBroker().sendRPCMessage('contacts:rpc_queue:getCustomerName', customer);
    }
  }
  if (contentType === MODULE_NAMES.COMPANY) {
    const company = await messageBroker().sendRPCMessage(
      'contacts:rpc_queue:findCompany',
      { _id: contentTypeId }
    );

    if (company) {
      name = company.primaryName || company.primaryEmail || company.primaryPhone || 'Unknown';
    }
  }
  if (contentType === MODULE_NAMES.USER) {
    const user = await messageBroker().sendRPCMessage('core:rpc_queue:findOneUser', { _id: contentTypeId })

    if (user) {
      name = user.username || user.email || '';
    }
  }
  if (contentType === MODULE_NAMES.PRODUCT) {
    const product = await messageBroker().sendRPCMessage('products:rpc_queue:findOne', { _id: contentTypeId });

    if (product) {
      name = product.name;
    }
  }

  return name;
};

const gatherDescriptions = async (obj: IInternalNoteDocument) => {
  let extraDesc: LogDesc[] = [
    {
      contentTypeId: obj.contentTypeId,
      name: await findContentItemName(obj.contentType, obj.contentTypeId)
    }
  ];

  extraDesc = await gatherNames({
    foreignKey: 'createdUserId',
    prevList: extraDesc,
    nameFields: ['email', 'username'],
    items: [await messageBroker().sendRPCMessage('core:rpc_queue:findOneUser', { _id: obj.createdUserId })]
  });

  return extraDesc;
};

export const putDeleteLog = async (logDoc: ILogDataParams, user) => {
  await commonPutDeleteLog(
    messageBroker(),
    { ...logDoc, extraDesc: await gatherDescriptions(logDoc.object), type: `internalnotes:${logDoc.type}` },
    user
  );
};

export const putUpdateLog = async (logDoc: ILogDataParams, user) => {
  await commonPutUpdateLog(
    messageBroker(),
    { ...logDoc, extraDesc: await gatherDescriptions(logDoc.object), type: `internalnotes:${logDoc.type}` },
    user
  );
};

export const putCreateLog = async (logDoc: ILogDataParams, user) => {
  await commonPutCreateLog(
    messageBroker(),
    { ...logDoc, extraDesc: await gatherDescriptions(logDoc.object), type: `internalnotes:${logDoc.type}` },
    user
  );
};