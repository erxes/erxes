import {
  sendTRPCMessage,
  TActivityGetterResponse,
} from 'erxes-api-shared/utils';
import { IDeal } from '../../@types';

export const generateAssigneeActivity = async (
  subdomain: string,
  fullDocument: IDeal,
  prevDocument?: IDeal,
): Promise<TActivityGetterResponse[]> => {
  const { assignedUserIds: prevAssignedUserIds = [] } = prevDocument || {};
  const { assignedUserIds: newAssignedUserIds = [] } = fullDocument || {};

  const removedAssignedUserIds = prevAssignedUserIds.filter(
    (id) => !newAssignedUserIds.includes(id),
  );
  const addedAssignedUserIds = newAssignedUserIds.filter(
    (id) => !prevAssignedUserIds.includes(id),
  );

  const users = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'users',
    action: 'find',
    input: {
      query: {
        _id: { $in: [...addedAssignedUserIds, ...removedAssignedUserIds] },
      },
      fields: {
        _id: 1,
        email: 1,
        detail: 1,
        username: 1,
      },
    },
    defaultValue: [],
  });

  const activities: TActivityGetterResponse[] = [];

  if (removedAssignedUserIds.length) {
    const removedUsers = users.filter((user) =>
      removedAssignedUserIds.includes(user._id),
    );

    activities.push({
      targetType: 'sales.deal',
      target: {
        moduleName: 'sales',
        collectionName: 'deal',
        text: fullDocument.name,
        data: fullDocument,
      },
      contextType: 'user',
      context: {
        moduleName: 'user',
        collectionName: 'user',
        text: removedUsers.map((user) => user.username).join(', '),
        data: removedUsers.map((user) => ({
          _id: user._id,
          email: user.email,
          detail: user.detail,
          username: user.username,
        })),
      },
      action: {
        type: 'unassigned',
        description: 'removed assignee',
      },
    });
  }

  if (addedAssignedUserIds.length) {
    const addedUsers = users.filter((user) =>
      addedAssignedUserIds.includes(user._id),
    );

    activities.push({
      targetType: 'sales.deal',
      target: {
        moduleName: 'sales',
        collectionName: 'deal',
        text: fullDocument.name,
        data: fullDocument,
      },
      contextType: 'user',
      context: {
        moduleName: 'user',
        collectionName: 'user',
        text: addedUsers.map((user) => user.username).join(', '),
        data: addedUsers.map((user) => ({
          _id: user._id,
          email: user.email,
          detail: user.detail,
          username: user.username,
        })),
      },
      action: {
        type: 'assigned',
        description: 'added assignee',
      },
    });
  }

  return activities;
};
