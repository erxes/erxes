import { IContext } from '~/connectionResolvers';
import { OAuthClientAppType } from '@/auth/db/definitions/oauthClientApps';

type OAuthClientAppMutationArgs = {
  _id?: string;
  name: string;
  logo?: string;
  description?: string;
  type: OAuthClientAppType;
  redirectUrls?: string[];
};

const buildOAuthClientQuery = (searchValue?: string) => {
  const query: Record<string, any> = {};

  if (searchValue) {
    query.$or = [
      { name: new RegExp(`.*${searchValue}.*`, 'i') },
      { clientId: new RegExp(`.*${searchValue}.*`, 'i') },
    ];
  }

  return query;
};

export const oauthClientAppQueries = {
  async oauthClientApps(
    _parent: undefined,
    { searchValue, page = 1, perPage = 20 }: any,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('appsRead');

    return models.OAuthClientApps.find(buildOAuthClientQuery(searchValue))
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });
  },

  async oauthClientAppsTotalCount(
    _parent: undefined,
    { searchValue }: { searchValue?: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('appsRead');

    return models.OAuthClientApps.countDocuments(
      buildOAuthClientQuery(searchValue),
    );
  },

  async oauthClientAppDetail(
    _parent: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('appsRead');

    return models.OAuthClientApps.findOne({ _id });
  },
};

export const oauthClientAppMutations = {
  async oauthClientAppsAdd(
    _parent: undefined,
    params: OAuthClientAppMutationArgs,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('appsManage');

    return models.OAuthClientApps.createOAuthClientApp(params);
  },

  async oauthClientAppsEdit(
    _parent: undefined,
    { _id, ...doc }: OAuthClientAppMutationArgs & { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('appsManage');

    return models.OAuthClientApps.updateOAuthClientApp(_id, doc);
  },

  async oauthClientAppsRevoke(
    _parent: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('appsManage');

    return models.OAuthClientApps.revokeOAuthClientApp(_id);
  },

  async oauthClientAppsRemove(
    _parent: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('appsManage');

    return models.OAuthClientApps.removeOAuthClientApp(_id);
  },
};
