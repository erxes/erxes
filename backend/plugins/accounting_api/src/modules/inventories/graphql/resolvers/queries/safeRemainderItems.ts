import {
  escapeRegExp,
  paginate,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';
import { getLastIncomePrices } from '~/modules/accounting/utils/inventories';
import { ISafeRemainderItemDocument } from '../../../@types/safeRemainderItems';

interface ISafeRemainderItemsQueryParams {
  remainderId: string;
  productCategoryIds?: string[];
  status?: string;
  searchValue?: string;
  diffType?: string;
  page?: number;
  perPage?: number;
}

interface IReference {
  _id: string;
}

const DIFF_TYPE_OPERATORS: Record<string, '$gt' | '$lt' | '$eq' | '$ne'> = {
  gt: '$gt',
  lt: '$lt',
  eq: '$eq',
  ne: '$ne',
};

const canViewSafeRemainderItemCounts = async (
  checkPermission: IContext['checkPermission'],
) => {
  try {
    await checkPermission('viewSafeRemainderItemCounts');
    return true;
  } catch {
    return false;
  }
};

export const generateFilterItems = async (
  subdomain: string,
  params: ISafeRemainderItemsQueryParams,
) => {
  const { remainderId, productCategoryIds, status, diffType, searchValue } =
    params;
  const query: FilterQuery<ISafeRemainderItemDocument> = { remainderId };
  let productIds: string[] | undefined;

  if (productCategoryIds?.length) {
    const categories = (await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'productCategories',
      action: 'withChilds',
      input: { ids: productCategoryIds },
      defaultValue: [],
    })) as IReference[];

    const products = (await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'products',
      action: 'find',
      input: {
        query: { categoryId: { $in: categories.map((c) => c._id) } },
      },
      defaultValue: [],
    })) as IReference[];

    productIds = products.map((product) => product._id);
  }

  if (searchValue) {
    const regex = { $regex: `.*${escapeRegExp(searchValue)}.*`, $options: 'i' };
    const products = (await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'products',
      action: 'find',
      input: {
        query: {
          $or: [{ code: regex }, { name: regex }, { barcodes: regex }],
        },
        fields: { _id: 1 },
      },
      defaultValue: [],
    })) as IReference[];

    const searchIds = products.map((product) => product._id);

    if (productIds) {
      const searchIdSet = new Set(searchIds);
      productIds = productIds.filter((id) => searchIdSet.has(id));
    } else {
      productIds = searchIds;
    }
  }

  if (productIds) {
    query.productId = { $in: productIds };
  }

  if (status) {
    query.status = status;
  }

  const diffOperator = DIFF_TYPE_OPERATORS[diffType ?? ''];

  if (diffOperator) {
    query.$expr = { [diffOperator]: ['$count', '$preCount'] };
  }

  return query;
};

const safeRemainderItemsQueries = {
  safeRemainderItems: async (
    _root: undefined,
    params: ISafeRemainderItemsQueryParams,
    { models, subdomain, checkPermission }: IContext,
  ) => {
    await checkPermission('readSafeRemainders');
    const canViewItemCounts =
      await canViewSafeRemainderItemCounts(checkPermission);
    const filterParams = canViewItemCounts
      ? params
      : { ...params, diffType: undefined };

    const query = await generateFilterItems(subdomain, filterParams);
    const items: ISafeRemainderItemDocument[] = await paginate(
      models.SafeRemainderItems.find(query).sort({ order: 1 }).lean(),
      params,
    );
    const lastIncomePrices = await getLastIncomePrices(
      models,
      items.map((item) => item.productId),
    );

    return items.map((item) => ({
      ...item,
      trInfo: {
        ...item.trInfo,
        lastIncomePrice: lastIncomePrices[item.productId] ?? 0,
      },
    }));
  },

  safeRemainderItemsCount: async (
    _root: undefined,
    params: ISafeRemainderItemsQueryParams,
    { models, subdomain, checkPermission }: IContext,
  ) => {
    await checkPermission('readSafeRemainders');
    const canViewItemCounts =
      await canViewSafeRemainderItemCounts(checkPermission);
    const filterParams = canViewItemCounts
      ? params
      : { ...params, diffType: undefined };

    const query = await generateFilterItems(subdomain, filterParams);
    return models.SafeRemainderItems.find(query).countDocuments();
  },
};

export default safeRemainderItemsQueries;
