import { sendCommonMessage } from './messageBroker';
import { sendCoreMessage } from './messageBroker';
import { generateModels, IModels } from './connectionResolver';
import { IUserDocument } from '@erxes/api-utils/src/types';

export const countDocuments = async (
  subdomain: string,
  type: string,
  _ids: string[],
) => {
  const [serviceName, contentType] = type.split(':');

  return sendCommonMessage({
    subdomain,
    action: 'goal',
    serviceName,
    data: {
      type: contentType,
      _ids,
      action: 'count',
    },
    isRPC: true,
  });
};

export const compareArrays = (arr1, arr2) => {
  const addedItems = arr2.filter((item) => !arr1.includes(item));
  const removedItems = arr1.filter((item) => !arr2.includes(item));

  if (addedItems.length === 0 && removedItems.length === 0) {
    return null;
  } else {
    return {
      added: addedItems,
      removed: removedItems,
    };
  }
};
