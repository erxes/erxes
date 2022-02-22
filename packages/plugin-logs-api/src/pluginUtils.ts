import { IListArgs } from './graphql/resolvers/activityLogQueries';
import * as allModels from './apiCollections';
import { IActivityLogDocument } from './models/ActivityLogs';
import { IUserDocument } from '@erxes/api-utils/src/types';

export { allModels };

interface ISubActivityContents {
  [activityType: string]: {
    handler: any[];
    collectItems?: IActivityLogDocument[];
  };
}
interface IActivityContents {
  [contentType: string]: ISubActivityContents[];
}

const callActivityContents: IActivityContents | {} = {};

export const collectPluginContent = async (
  doc: IListArgs,
  user: IUserDocument,
  activities: IActivityLogDocument[],
  collectItemsDefault: (items: any, type?: string) => void
) => {
  if (!callActivityContents) {
    return;
  }

  const { contentType, activityType } = doc;

  // not used type in plugins
  if (!callActivityContents[contentType]) {
    return;
  }

  // not used this type's action in plugins
  if (!callActivityContents[contentType][activityType]) {
    return;
  }

  try {
    const activityContent = callActivityContents[contentType][activityType];
    const { handler, collectItems } = activityContent;
    const items = await handler({}, doc, {
      user,
      models: allModels
    });

    if (collectItems) {
      return collectItems(activities, items);
    }

    return collectItemsDefault(items);
  } catch (e) {
    throw new Error(e.message);
  }
};
