import { Resolver } from 'erxes-api-shared/core-types';
import { defaultPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

export interface IListArgs {
  page?: number;
  perPage?: number;
  searchValue?: string;
  brandId?: string;
}

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);

const buildQuery = ({ searchValue, brandId }: IListArgs) => {
  const query: Record<string, unknown> = {};

  const search = searchValue?.trim();

  if (search) {
    const safeSearch = escapeRegExp(search);

    query.$or = [
      { title: { $regex: `.*${safeSearch}.*`, $options: 'i' } },
      { description: { $regex: `.*${safeSearch}.*`, $options: 'i' } },
      { url: { $regex: `.*${safeSearch}.*`, $options: 'i' } },
    ];
  }

  if (brandId) {
    query.brandId = brandId;
  }

  return query;
};

export const helpCenterConfigQueries: Record<
  string,
  Resolver<any, any, IContext>
> = {
  async helpCenterConfig(
    _root,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('showHelpCenter');

    return models.HelpCenterConfigs.getConfig(_id);
  },

  async helpCenterConfigs(
    _root,
    args: IListArgs,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('showHelpCenter');

    return defaultPaginate(
      models.HelpCenterConfigs.find(buildQuery(args)).sort({
        createdAt: -1,
      }),
      { page: args.page, perPage: args.perPage },
    );
  },

  async helpCenterConfigsTotalCount(
    _root,
    args: IListArgs,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('showHelpCenter');

    return models.HelpCenterConfigs.countDocuments(buildQuery(args));
  },

  async helpCenterGetConfigByDomain(
    _root,
    { domain }: { domain: string },
    { models }: IContext,
  ) {
    return models.HelpCenterConfigs.getConfigByDomain(domain);
  },
};

helpCenterConfigQueries.helpCenterGetConfigByDomain.wrapperConfig = {
  skipPermission: true,
};
