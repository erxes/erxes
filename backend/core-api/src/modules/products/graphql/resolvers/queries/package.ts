import { IContext } from '~/connectionResolvers';
import { IPackageDocument, IPackageParams } from '@/products/@types/package';
import { cursorPaginate } from 'erxes-api-shared/utils';

export const packageQueries = {
  async packages(
    _parent: undefined,
    params: IPackageParams,
    { models }: IContext,
  ) {
    const { searchValue, status, ids } = params;

    const filter: any = {
      status: { $ne: 'archived' },
    };

    if (status) filter.status = status;

    if (ids?.length) filter._id = { $in: ids };

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

  async packageDetail(
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.Packages.getPackage(_id);
  },
};
