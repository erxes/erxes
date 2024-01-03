import { IContext } from '../../../connectionResolver';
import {
  IReserveRem,
  IReserveRemsAddParams
} from '../../../models/definitions/reserveRems';
import {
  moduleCheckPermission,
  moduleRequireLogin
} from '@erxes/api-utils/src/permissions';
import { getProducts } from './utils';

const reserveRemsMutations = {
  reserveRemsAdd: async (
    _root: any,
    doc: IReserveRemsAddParams,
    { user, models, subdomain }: IContext
  ) => {
    const {
      departmentIds,
      branchIds,
      remainder,
      productCategoryId,
      productId
    } = doc;
    if (!departmentIds || !branchIds) {
      throw new Error('Must fill departmend and branch');
    }

    if (!productCategoryId && !productId) {
      throw new Error('Must fill product category or product');
    }

    const { products, productIds } = await getProducts(
      subdomain,
      productId,
      productCategoryId
    );

    const oldReserveRems = await models.ReserveRems.find({
      departmentId: { $in: departmentIds },
      branchId: { $in: branchIds },
      productId: { $in: productIds }
    });

    const oldReserveRemsByKey = {};
    for (const reserveRem of oldReserveRems) {
      oldReserveRemsByKey[
        `${reserveRem.branchId}_${reserveRem.departmentId}_${reserveRem.productId}`
      ] = reserveRem;
    }

    let bulkUpdateOps: any[] = [];
    let bulkCreateOps: any[] = [];
    const updatedIds: string[] = [];
    const now = new Date();
    const inserteds: any = [];

    let updateCounter = 0;
    let insertCounter = 0;

    for (const branchId of branchIds) {
      for (const departmentId of departmentIds) {
        for (const product of products) {
          const key = `${branchId}_${departmentId}_${product._id}`;

          const oldReserveRem = oldReserveRemsByKey[key];

          if (oldReserveRem) {
            bulkUpdateOps.push({
              updateOne: {
                filter: {
                  _id: oldReserveRem._id
                },
                update: {
                  $set: {
                    remainder,
                    modifiedAt: now,
                    modifiedBy: user._id
                  }
                }
              }
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
              createBy: user._id
            });

            insertCounter += 1;

            if (insertCounter > 100) {
              const inserted = await models.ReserveRems.insertMany(
                bulkCreateOps
              );
              inserteds.push(inserted);
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
      inserteds.push(inserted);
    }

    return inserteds.concat(
      await models.ReserveRems.find({ _id: { $in: updatedIds } }).lean()
    );
  },

  reserveRemEdit: async (
    _root,
    doc: IReserveRem & { _id: string },
    { models, user }: IContext
  ) => {
    const { _id, ...params } = doc;
    const reserveRem = await models.ReserveRems.getReserveRem({ _id });
    return await models.ReserveRems.reserveRemEdit(
      _id,
      {
        ...reserveRem,
        ...params
      },
      user
    );
  },

  reserveRemsRemove: async (
    _root: any,
    { _ids }: { _ids: string[] },
    { models }: IContext
  ) => {
    return await models.ReserveRems.reserveRemsRemove(_ids);
  }
};

moduleRequireLogin(reserveRemsMutations);
moduleCheckPermission(reserveRemsMutations, 'manageSalesPlans');

export default reserveRemsMutations;
