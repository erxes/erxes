import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  IPackage,
  IPackageDocument,
  IPackageParams,
  IPackageProduct,
} from '@/products/@types/package';
import { PACKAGE_STATUSES } from '@/products/constants';
import { packageSchema } from '@/products/db/definitions/packages';

export interface IPackageModel extends Model<IPackageDocument> {
  getPackage(_id: string): Promise<IPackageDocument>;
  createPackage(doc: IPackage): Promise<IPackageDocument>;
  updatePackage(_id: string, doc: Partial<IPackage>): Promise<IPackageDocument>;
  changePackageStatus(
    _ids: string[],
    status: string,
  ): Promise<IPackageDocument[]>;
  removePackages(_ids: string[]): Promise<{ n: number; ok: number }>;
}

const normalizeProducts = (items?: IPackageProduct[]) =>
  Array.from(
    new Map(
      (items || []).filter((p) => p.productId).map((p) => [p.productId, p]),
    ).values(),
  ).map((p) => ({
    productId: p.productId,
    quantity: Math.max(1, p.quantity || 1),
  }));

export const loadPackageClass = (models: IModels) => {
  class Package {
    public static async getPackage(_id: string) {
      const pkg = await models.Packages.findOne({ _id }).lean();
      if (!pkg) throw new Error('Package not found');
      return pkg;
    }

    public static async createPackage(doc: IPackage) {
      if (!doc.name?.trim()) throw new Error('name is required');

      const products = normalizeProducts(doc.products);
      if (!products.length) throw new Error('At least one product is required');

      if (doc.price != null && (Number.isNaN(doc.price) || doc.price < 0)) {
        throw new Error('price must be a non-negative number');
      }

      return models.Packages.create({
        ...doc,
        products,
        status: doc.status || PACKAGE_STATUSES.ACTIVE,
      });
    }

    public static async updatePackage(_id: string, doc: Partial<IPackage>) {
      await models.Packages.getPackage(_id);

      const update: Record<string, any> = {};

      if (doc.name !== undefined) {
        if (!doc.name.trim()) throw new Error('name cannot be empty');
        update.name = doc.name;
      }
      if (doc.description !== undefined) update.description = doc.description;
      if (doc.coverImage !== undefined) update.coverImage = doc.coverImage;

      if (doc.price !== undefined) {
        if (doc.price !== null && (Number.isNaN(doc.price) || doc.price < 0)) {
          throw new Error('price must be a non-negative number');
        }
        update.price = doc.price;
      }

      if (doc.percent !== undefined) {
        if (
          doc.percent !== null &&
          (Number.isNaN(doc.percent) || doc.percent < 0 || doc.percent > 100)
        ) {
          throw new Error('percent must be between 0 and 100');
        }
        update.percent = doc.percent;
      }

      if (doc.products !== undefined) {
        const products = normalizeProducts(doc.products);
        if (!products.length)
          throw new Error('At least one product is required');
        update.products = products;
      }

      if (doc.tagIds !== undefined) update.tagIds = doc.tagIds;

      if (doc.status !== undefined) {
        if (!PACKAGE_STATUSES.ALL.includes(doc.status)) {
          throw new Error(
            `status must be one of: ${PACKAGE_STATUSES.ALL.join(', ')}`,
          );
        }
        update.status = doc.status;
      }

      return await models.Packages.findOneAndUpdate(
        { _id },
        { $set: update },
        { new: true },
      ).lean();
    }

    public static async changePackageStatus(_ids: string[], status: string) {
      if (!PACKAGE_STATUSES.ALL.includes(status)) {
        throw new Error(
          `status must be one of: ${PACKAGE_STATUSES.ALL.join(', ')}`,
        );
      }

      await models.Packages.updateMany(
        { _id: { $in: _ids } },
        { $set: { status } },
      );

      return models.Packages.find({ _id: { $in: _ids } }).lean();
    }

    public static async removePackages(_ids: string[]) {
      return models.Packages.updateMany(
        { _id: { $in: _ids } },
        { $set: { status: PACKAGE_STATUSES.ARCHIVED } },
      );
    }
  }

  packageSchema.loadClass(Package);
  return packageSchema;
};
