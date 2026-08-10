import { IContext } from '~/connectionResolvers';
import { IPackage } from '@/products/@types/package';

export const packageMutations = {
  async productPackagesAdd(
    _root: undefined,
    doc: IPackage,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('productsCreate');

    return models.Packages.createPackage(doc as any);
  },

  async productPackagesEdit(
    _root: undefined,
    { _id, ...doc }: { _id: string } & Partial<IPackage>,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('productsUpdate');

    return models.Packages.updatePackage(_id, doc);
  },

  async productPackagesChangeStatus(
    _root: undefined,
    { _ids, status }: { _ids: string[]; status: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('productsUpdate');

    return models.Packages.changePackageStatus(_ids, status);
  },

  async productPackagesRemove(
    _root: undefined,
    { _ids }: { _ids: string[] },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('productsDelete');

    return models.Packages.removePackages(_ids);
  },
};
