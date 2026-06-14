import { IContext } from '~/connectionResolvers';
import { IPackageDocument, IPackageParams } from '@/products/@types/package';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { Resolver } from 'erxes-api-shared/core-types';

export const packageQueries: Record<string, Resolver> = {
  async productPackages(
    _parent: undefined,
    params: IPackageParams,
    { models }: IContext,
  ) {
    const { searchValue, status, ids, tagIds } = params;

    const filter: any = {
      status: { $ne: 'archived' },
    };

    if (status) filter.status = status;

    if (ids?.length) filter._id = { $in: ids };

    if (tagIds?.length) filter.tagIds = { $in: tagIds };

    if (searchValue) {
      filter.$or = [
        { name: { $regex: searchValue, $options: 'i' } },
        { description: { $regex: searchValue, $options: 'i' } },
      ];
    }

    return cursorPaginate<IPackageDocument>({
      model: models.Packages,
      params,
      query: filter,
    });
  },

  async productPackageDetail(
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.Packages.getPackage(_id);
  },
};

packageQueries.productPackages.wrapperConfig = { skipPermission: true };
packageQueries.productPackageDetail.wrapperConfig = { skipPermission: true };