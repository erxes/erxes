import { IContext } from '~/connectionResolvers';
import {
  IReserveRemsAddParams,
  IReserveRem,
  IReserveRemDocument,
} from '~/modules/inventories/@types/reserveRems';
import { getProducts } from './utils';
import {
  validateRequiredId,
  validateRequiredIds,
} from '~/modules/accounting/graphql/validateRequired';

const reserveRemsMutations = {
  reserveRemsAdd: async (
    _root: unknown,
    doc: IReserveRemsAddParams,
    { user, models, subdomain }: IContext,
  ) => {
    const {
      departmentIds,
      branchIds,
      remainder,
      productCategoryId,
      productId,
    } = doc;
    if (!productCategoryId && !productId) {
      throw new Error('Must fill product category or product');
    }

    const { products, productIds } = await getProducts(
      subdomain,
      productId,
      productCategoryId,
    );
    const targetBranchIds = branchIds?.length ? branchIds : ['_'];
    const targetDepartmentIds = departmentIds?.length ? departmentIds : ['_'];

    const oldReserveRems = await models.ReserveRems.find({
      departmentId: { $in: targetDepartmentIds },
      branchId: { $in: targetBranchIds },
      productId: { $in: productIds },
    });

    const oldReserveRemsByKey: Record<string, IReserveRemDocument> = {};
    for (const reserveRem of oldReserveRems) {
      oldReserveRemsByKey[
        `${reserveRem.branchId}_${reserveRem.departmentId}_${reserveRem.productId}`
      ] = reserveRem;
    }

    let bulkUpdateOps: Parameters<typeof models.ReserveRems.bulkWrite>[0] = [];
    let bulkCreateOps: (Omit<IReserveRem, 'uom'> & {
      uom?: string;
      createdAt: Date;
      createdBy: string;
    })[] = [];
    const updatedIds: string[] = [];
    const now = new Date();
    const inserteds: (Omit<IReserveRem, 'uom'> & {
      _id: string;
      uom?: string;
    })[] = [];

    let updateCounter = 0;
    let insertCounter = 0;

    for (const branchId of targetBranchIds) {
      for (const departmentId of targetDepartmentIds) {
        for (const product of products) {
          const key = `${branchId}_${departmentId}_${product._id}`;

          const oldReserveRem = oldReserveRemsByKey[key];

          if (oldReserveRem) {
            bulkUpdateOps.push({
              updateOne: {
                filter: {
                  _id: oldReserveRem._id,
                },
                update: {
                  $set: {
                    remainder,
                    modifiedAt: now,
                    modifiedBy: user._id,
                  },
                },
              },
            });

            updatedIds.push(oldReserveRem._id);
            updateCounter += 1;

            if (updateCounter > 100) {
              await models.ReserveRems.bulkWrite(bulkUpdateOps);
              bulkUpdateOps = [];
            }
          } else {
            bulkCreateOps.push({
              branchId,
              departmentId,
              productId: product._id,
              uom: product.uom,
              remainder,
              createdAt: now,
              createdBy: user._id,
            });

            insertCounter += 1;

            if (insertCounter > 100) {
              const inserted = await models.ReserveRems.insertMany(
                bulkCreateOps,
              );
              inserteds.push(...inserted);
              bulkCreateOps = [];
            }
          }
        }
      }
    }

    if (bulkUpdateOps.length) {
      await models.ReserveRems.bulkWrite(bulkUpdateOps);
    }

    if (bulkCreateOps.length) {
      const inserted = await models.ReserveRems.insertMany(bulkCreateOps);
      inserteds.push(...inserted);
    }

    return inserteds.concat(
      await models.ReserveRems.find({ _id: { $in: updatedIds } }).lean(),
    );
  },

  reserveRemEdit: async (
    _root,
    doc: IReserveRem & { _id: string },
    { models, user }: IContext,
  ) => {
    const { _id, ...params } = doc;
    validateRequiredId(_id);
    await models.ReserveRems.getReserveRem({ _id });
    await models.ReserveRems.reserveRemEdit(_id, params, user);
    return await models.ReserveRems.findOne({ _id }).lean();
  },

  reserveRemsRemove: async (
    _root: unknown,
    { _ids }: { _ids: string[] },
    { models }: IContext,
  ) => {
    validateRequiredIds(_ids, '_ids');
    return await models.ReserveRems.reserveRemsRemove(_ids);
  },
};

export { reserveRemsMutations };
