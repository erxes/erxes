import { sendCommonMessage } from './messageBroker';
import { sendCoreMessage, sendNotificationsMessage } from './messageBroker';
import { generateModels, IModels } from './connectionResolver';
import { IUserDocument } from '@erxes/api-utils/src/types';
import { IGoalDocument } from './models/definitions/goals';

export interface IGoalNotificationParams {
  item: IGoalDocument;
  user: IUserDocument;
  type: string;
  action?: string;
  content?: string;
  contentType: string;
  invitedUsers?: string[];
  removedUsers?: string[];
}

export const countDocuments = async (
  subdomain: string,
  type: string,
  _ids: string[]
) => {
  const [serviceName, contentType] = type.split(':');

  return sendCommonMessage({
    subdomain,
    action: 'goal',
    serviceName,
    data: {
      type: contentType,
      _ids,
      action: 'count'
    },
    isRPC: true
  });
};

export const goalObject = async (
  subdomain: string,
  type: string,
  goalIds: string[],
  targetIds: string[]
) => {
  const [serviceName, contentType] = type.split(':');

  return sendCommonMessage({
    subdomain,
    serviceName,
    action: 'goal',
    data: {
      goalIds,
      targetIds,
      type: contentType,
      action: 'goalObject'
    },
    isRPC: true
  });
};
export const sendNotification = (subdomain: string, data) => {
  return sendNotificationsMessage({ subdomain, action: 'send', data });
};
export const fixRelatedItems = async ({
  subdomain,
  type,
  sourceId,
  destId,
  action
}: {
  subdomain: string;
  type: string;
  sourceId: string;
  destId?: string;
  action: string;
}) => {
  const [serviceName, contentType] = type.split(':');

  sendCommonMessage({
    subdomain,
    serviceName,
    action: 'fixRelatedItems',
    data: {
      sourceId,
      destId,
      type: contentType,
      action
    }
  });
};
