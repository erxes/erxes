import { Model } from 'mongoose';
import * as _ from 'underscore';
import { IModels } from '../connectionResolver';
import { sendProductsMessage } from '../messageBroker';
import { getRatio } from '../utils';
import {
  IRemainderCount,
  IRemainderParams,
  IRemainderProductsParams,
  IRemaindersParams,
  IRemainder,
  IRemainderDocument,
  remainderSchema
} from './definitions/remainders';

export interface IRemainderModel extends Model<IRemainderDocument> {
  getRemainder(_id: string): Promise<IRemainderDocument>;
  getRemainderCount(
    subdomain: string,
    params: IRemainderParams
  ): Promise<IRemainderCount>;
  getRemainderProducts(
    subdomain: string,
    params: IRemainderProductsParams
  ): Promise<JSON>;
  getRemainders(
    subdomain: string,
    params: IRemaindersParams
  ): Promise<IRemainderDocument[]>;
  createRemainder(doc: IRemainder): Promise<IRemainderDocument>;
  updateRemainder(
    _id: string,
    doc: Partial<IRemainder>
  ): Promise<IRemainderDocument>;
  updateRemainders(
    subdomain: string,
    branchId: string,
    departmentId: string,
    data: { productId: string; uomId: string; diffCount: number }[]
  );
  removeRemainder(_id: string): void;
}

export const loadRemainderClass = (models: IModels) => {
  class Remainder {
    /**
     * Get a remainder
     * @param _id Remainder object id
     * @returns Found remainder object
     */
    public static async getRemainder(_id: string) {
      const result: any = await models.Remainders.findById(_id);

      if (!result) throw new Error('Remainder not found!');

      return result;
    }

    /**
     * Get remainder count
     * @param subdomain
     * @param params Filter to get remainder document
     * @returns Product's count with uom
     */
    public static async getRemainderCount(
      subdomain: string,
      params: IRemainderParams
    ) {
      const { productId, departmentId, branchId, uomId } = params;
      const filter: any = { productId };

      if (departmentId) filter.departmentId = departmentId;
      if (branchId) filter.branchId = branchId;

      const remainders: any = await models.Remainders.find(filter);

      let count = 0;
      for (const item of remainders) count += item.count;

      const product: any = await sendProductsMessage({
        subdomain,
        action: 'findOne',
        data: {
          query: { _id: productId }
        },
        isRPC: true
      });

      let uom: any = product.uomId;
      const subUom: any =
        product.subUom.filter((item: any) => item.uomId === uomId) || [];

      if (subUom.length) {
        count = count / subUom.ratio || 1;
        uom = subUom.uomId;
      }

      return { count, uomId: uom };
    }

    public static async getRemainderProducts(
      subdomain: string,
      params: IRemainderProductsParams
    ) {
      const query: any = { status: { $ne: 'deleted' } };

      if (params.categoryId) {
        const productCategories = await sendProductsMessage({
          subdomain,
          action: 'categories.withChilds',
          data: {
            _id: params.categoryId
          },
          isRPC: true,
          defaultValue: []
        });

        const productCategoryIds = productCategories.map(
          (item: any) => item._id
        );

        query.categoryId = { $in: productCategoryIds };
      }

      if (params.searchValue) {
        const regexOption = {
          $regex: `.*${params.searchValue}.*`,
          $options: 'i'
        };

        query.$or = [
          {
            name: regexOption
          },
          {
            code: regexOption
          }
        ];
      }

      const limit = params.perPage || 20;
      const skip = params.page ? (params.page - 1) * limit : 0;

      const products = await sendProductsMessage({
        subdomain,
        action: 'find',
        data: {
          query,
          sort: {},
          skip,
          limit
        },
        isRPC: true
      });

      const totalCount = await sendProductsMessage({
        subdomain,
        action: 'count',
        data: {
          query
        },
        isRPC: true
      });

      const productIds = products.map((product: any) => product._id);

      const remainderQuery: any = {
        productId: { $in: productIds }
      };

      if (params.departmentId) {
        remainderQuery.departmentId = params.departmentId;
      }

      if (params.branchId) {
        remainderQuery.branchId = params.branchId;
      }

      const remainders = await models.Remainders.find(remainderQuery).lean();
      const remaindersByProductId = {};

      for (const rem of remainders) {
        if (!Object.keys(remaindersByProductId).includes(rem.productId)) {
          remaindersByProductId[rem.productId] = 0;
        }
        remaindersByProductId[rem.productId] =
          remaindersByProductId[rem.productId] + rem.count;
      }

      for (const product of products) {
        const count = remaindersByProductId[product._id] || 0;
        product.remainder = count;
      }

      return { totalCount, products };
    }

    /**
     * Get Remainders
     * @param subdomain
     * @param params Filter to get remainder documents
     * @returns Array of Remainder
     */
    public static async getRemainders(
      subdomain: string,
      params: IRemaindersParams
    ) {
      const {
        departmentIds,
        branchIds,
        productCategoryId,
        productIds
      } = params;
      const filter: any = {};

      if (departmentIds && departmentIds.length) {
        filter.departmentId = { $in: departmentIds };
      }

      if (branchIds && branchIds.length) {
        filter.branchId = { $in: branchIds };
      }

      if (productCategoryId) {
        const limit: number = await sendProductsMessage({
          subdomain,
          action: 'count',
          data: {
            query: {},
            categoryId: productCategoryId
          },
          isRPC: true
        });

        const products: any = await sendProductsMessage({
          subdomain,
          action: 'find',
          data: {
            query: {},
            categoryId: productCategoryId,
            limit
          },
          isRPC: true
        });

        filter.productId = { $in: products.map((item: any) => item._id) };
      }

      if (productIds) filter.productId = { $in: productIds };

      return models.Remainders.find(filter).lean();
    }

    /**
     * Create remainder
     * @param doc New data to create
     * @returns Created response
     */
    public static async createRemainder(doc: IRemainder) {
      return await models.Remainders.create({
        ...doc,
        createdAt: new Date()
      });
    }

    /**
     * Update remainder
     * @param _id Remainder ID
     * @param doc New data to update
     * @returns Updated object
     */
    public static async updateRemainder(_id: string, doc: IRemainder) {
      await models.Remainders.findByIdAndUpdate(_id, { $set: { ...doc } });
      return await this.getRemainder(_id);
    }

    public static async updateRemainders(
      subdomain: string,
      branchId: string,
      departmentId: string,
      productsData: { productId: string; uomId: string; diffCount: number }[],
      isCensus: false
    ) {
      let bulkOps: {
        updateOne: {
          filter: any;
          update: any;
          upsert: boolean;
        };
      }[] = [];

      const productIds = productsData.map(pd => pd.productId);
      const products = await sendProductsMessage({
        subdomain,
        action: 'find',
        data: { query: { _id: { $in: productIds } }, limit: productIds.length },
        isRPC: true,
        defaultValue: []
      });

      const productById = {};
      for (const product of products) {
        productById[product._id] = product;
      }

      for (const data of productsData) {
        const product = productById[data.productId];
        const ratio = getRatio(product, data.uomId || product.uomId);
        const diffCount = data.diffCount / (ratio || 1);
        if (!diffCount) {
          continue;
        }

        bulkOps.push({
          updateOne: {
            filter: { productId: data.productId, branchId, departmentId },
            update: {
              $inc: { count: diffCount },
              $set: { productId: data.productId, branchId, departmentId },
              $push: { shortLogs: { count: diffCount, date: new Date() } }
            },
            upsert: true
          }
        });

        if (bulkOps.length > 100) {
          await models.Remainders.bulkWrite(bulkOps);
          bulkOps = [];
        }
      }

      if (bulkOps.length) {
        await models.Remainders.bulkWrite(bulkOps);
      }

      return await models.Remainders.find({
        branchId,
        departmentId,
        productId: { $in: productIds }
      }).lean();
    }

    /**
     * Delete remainder
     * @param _id Remainder ID
     * @returns Deleted response
     */
    public static async removeRemainder(_id: string) {
      return await models.Remainders.findByIdAndDelete(_id);
    }
  }

  remainderSchema.loadClass(Remainder);

  return remainderSchema;
};
