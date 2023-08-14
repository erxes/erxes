import {
  checkPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import {
  sendCoreMessage,
  sendPosMessage,
  sendProcessesMessage,
  sendProductsMessage
} from '../../../messageBroker';
import {
  IRemainderParams,
  IRemainderProductsParams,
  IRemaindersParams
} from '../../../models/definitions/remainders';

const remainderQueries = {
  remainders: async (
    _root: any,
    params: IRemaindersParams,
    { models, subdomain }: IContext
  ) => {
    return await models.Remainders.getRemainders(subdomain, params);
  },

  remainderDetail: async (
    _root: any,
    { _id }: { _id: string },
    { models }: IContext
  ) => {
    return await models.Remainders.getRemainder(_id);
  },

  remainderCount: async (
    _root: any,
    params: IRemainderParams,
    { models, subdomain }: IContext
  ) => {
    return await models.Remainders.getRemainderCount(subdomain, params);
  },

  remainderProducts: async (
    _root: any,
    params: IRemainderProductsParams,
    { models, subdomain }: IContext
  ) => {
    return await models.Remainders.getRemainderProducts(subdomain, params);
  },

  remaindersLog: async (
    _root: any,
    params: {
      categoryId: string;
      productIds: string[];
      branchId: string;
      departmentId: string;
      beginDate: Date;
      endDate: Date;
      isDetailed: boolean;
    },
    { models, subdomain }: IContext
  ) => {
    const {
      categoryId,
      productIds,
      endDate,
      beginDate,
      branchId,
      departmentId
    } = params;
    const bDate = new Date(beginDate);
    const eDate = new Date(endDate);

    const productFilter: any = {};
    if (categoryId) {
      const productCategories = await sendProductsMessage({
        subdomain,
        action: 'categories.withChilds',
        data: {
          _id: categoryId
        },
        isRPC: true,
        defaultValue: []
      });
      const categoryIds = productCategories.map((item: any) => item._id);
      productFilter.categoryId = { $in: categoryIds };
    }
    if (productIds && productIds.length) {
      productFilter._id = { $in: productIds };
    }

    const products = await sendProductsMessage({
      subdomain,
      action: 'find',
      data: { query: productFilter },
      isRPC: true
    });
    const beProductIds = products.map(p => p._id);
    const productById = {};
    for (const product of products) {
      productById[product._id] = product;
    }

    const branch = await sendCoreMessage({
      subdomain,
      action: 'branches.findOne',
      data: { _id: branchId },
      isRPC: true
    });

    const department = await sendCoreMessage({
      subdomain,
      action: 'departments.findOne',
      data: { _id: departmentId },
      isRPC: true
    });

    const performsC1In = await sendProcessesMessage({
      subdomain,
      action: 'performs.aggregate',
      data: {
        aggregate: [
          {
            $match: {
              endAt: { $lt: bDate },
              status: 'confirmed',
              inBranchId: branchId,
              inDepartmentId: departmentId,
              'inProducts.productId': { $in: beProductIds }
            }
          },
          { $unwind: '$inProducts' },
          { $match: { 'inProducts.productId': { $in: beProductIds } } },
          {
            $group: {
              _id: {
                inBranchId: '$inBranchId',
                inDepartmentId: '$inDepartmentId',
                productId: '$inProducts.productId'
              },
              count: { $sum: '$inProducts.quantity' }
            }
          }
        ],
        replacers: [
          'aggregate[0].$match.endAt.$lt = new Date(aggregate[0].$match.endAt.$lt)'
        ]
      },
      isRPC: true
    });

    const performsC1Out = await sendProcessesMessage({
      subdomain,
      action: 'performs.aggregate',
      data: {
        aggregate: [
          {
            $match: {
              endAt: { $lt: bDate },
              status: 'confirmed',
              outBranchId: branchId,
              outDepartmentId: departmentId,
              'outProducts.productId': { $in: beProductIds }
            }
          },
          { $unwind: '$outProducts' },
          { $match: { 'outProducts.productId': { $in: beProductIds } } },
          {
            $group: {
              _id: {
                outBranchId: '$outBranchId',
                outDepartmentId: '$outDepartmentId',
                productId: '$outProducts.productId'
              },
              count: { $sum: '$outProducts.quantity' }
            }
          }
        ],
        replacers: [
          'aggregate[0].$match.endAt.$lt = new Date(aggregate[0].$match.endAt.$lt)'
        ]
      },
      isRPC: true
    });

    const performsBetIn = await sendProcessesMessage({
      subdomain,
      action: 'performs.aggregate',
      data: {
        aggregate: [
          {
            $match: {
              endAt: { $gte: bDate, $lte: eDate },
              status: 'confirmed',
              inBranchId: branchId,
              inDepartmentId: departmentId,
              'inProducts.productId': { $in: beProductIds }
            }
          },
          { $unwind: '$inProducts' },
          { $match: { 'inProducts.productId': { $in: beProductIds } } }
        ],
        replacers: [
          'aggregate[0].$match.endAt.$gte = new Date(aggregate[0].$match.endAt.$gte)',
          'aggregate[0].$match.endAt.$lte = new Date(aggregate[0].$match.endAt.$lte)'
        ]
      },
      isRPC: true
    });

    const performsBetOut = await sendProcessesMessage({
      subdomain,
      action: 'performs.aggregate',
      data: {
        aggregate: [
          {
            $match: {
              endAt: { $gte: bDate, $lte: eDate },
              status: 'confirmed',
              outBranchId: branchId,
              outDepartmentId: departmentId,
              'outProducts.productId': { $in: beProductIds }
            }
          },
          { $unwind: '$outProducts' },
          { $match: { 'outProducts.productId': { $in: beProductIds } } }
        ],
        replacers: [
          'aggregate[0].$match.endAt.$gte = new Date(aggregate[0].$match.endAt.$gte)',
          'aggregate[0].$match.endAt.$lte = new Date(aggregate[0].$match.endAt.$lte)'
        ]
      },
      isRPC: true
    });

    const result = {};

    for (const row of performsC1In) {
      const { inBranchId, inDepartmentId, productId } = row._id;
      if (!result[inBranchId]) {
        result[inBranchId] = {
          branch: `${branch.code} - ${branch.title}`,
          values: {}
        };
      }

      if (!result[inBranchId].values[inDepartmentId]) {
        result[inBranchId].values[inDepartmentId] = {
          department: `${department.code}- ${department.title}`,
          values: {}
        };
      }

      if (!result[inBranchId].values[inDepartmentId].values[productId]) {
        result[inBranchId].values[inDepartmentId].values[productId] = {
          product: `${(productById[productId] || {}).code} - ${
            (productById[productId] || {}).name
          }`,
          values: {
            begin: 0,
            in: 0,
            out: 0,
            end: 0,
            performs: []
          }
        };
      }

      result[inBranchId].values[inDepartmentId].values[
        productId
      ].values.begin += row.count;
      result[inBranchId].values[inDepartmentId].values[productId].values.end +=
        row.count;
    }

    for (const row of performsC1Out) {
      const { outBranchId, outDepartmentId, productId } = row._id;
      if (!result[outBranchId]) {
        result[outBranchId] = {
          branch: `${branch.code} - ${branch.title}`,
          values: {}
        };
      }

      if (!result[outBranchId].values[outDepartmentId]) {
        result[outBranchId].values[outDepartmentId] = {
          department: `${department.code}- ${department.title}`,
          values: {}
        };
      }

      if (!result[outBranchId].values[outDepartmentId].values[productId]) {
        result[outBranchId].values[outDepartmentId].values[productId] = {
          product: `${(productById[productId] || {}).code} - ${
            (productById[productId] || {}).name
          }`,
          values: {
            begin: 0,
            in: 0,
            out: 0,
            end: 0,
            performs: []
          }
        };
      }

      result[outBranchId].values[outDepartmentId].values[
        productId
      ].values.begin -= row.count;
      result[outBranchId].values[outDepartmentId].values[
        productId
      ].values.end -= row.count;
    }

    for (const row of performsBetIn) {
      const { inBranchId, inDepartmentId, inProducts } = row;
      const { productId } = inProducts;

      if (!result[inBranchId]) {
        result[inBranchId] = {
          branch: `${branch.code} - ${branch.title}`,
          values: {}
        };
      }

      if (!result[inBranchId].values[inDepartmentId]) {
        result[inBranchId].values[inDepartmentId] = {
          department: `${department.code}- ${department.title}`,
          values: {}
        };
      }

      if (!result[inBranchId].values[inDepartmentId].values[productId]) {
        result[inBranchId].values[inDepartmentId].values[productId] = {
          product: `${(productById[productId] || {}).code} - ${
            (productById[productId] || {}).name
          }`,
          values: {
            begin: 0,
            in: 0,
            out: 0,
            end: 0,
            performs: []
          }
        };
      }

      result[inBranchId].values[inDepartmentId].values[productId].values.in +=
        inProducts.quantity;
      result[inBranchId].values[inDepartmentId].values[productId].values.end +=
        inProducts.quantity;
      result[inBranchId].values[inDepartmentId].values[
        productId
      ].values.performs.push(row);
    }

    for (const row of performsBetOut) {
      const { outBranchId, outDepartmentId, outProducts } = row;
      const { productId } = outProducts;

      if (!result[outBranchId]) {
        result[outBranchId] = {
          branch: `${branch.code} - ${branch.title}`,
          values: {}
        };
      }

      if (!result[outBranchId].values[outDepartmentId]) {
        result[outBranchId].values[outDepartmentId] = {
          department: `${department.code}- ${department.title}`,
          values: {}
        };
      }

      if (!result[outBranchId].values[outDepartmentId].values[productId]) {
        result[outBranchId].values[outDepartmentId].values[productId] = {
          product: `${(productById[productId] || {}).code} - ${
            (productById[productId] || {}).name
          }`,
          values: {
            begin: 0,
            in: 0,
            out: 0,
            end: 0,
            performs: []
          }
        };
      }

      result[outBranchId].values[outDepartmentId].values[
        productId
      ].values.out += outProducts.quantity;
      result[outBranchId].values[outDepartmentId].values[
        productId
      ].values.end -= outProducts.quantity;
      result[outBranchId].values[outDepartmentId].values[
        productId
      ].values.performs.push(row);
    }

    return result;
  }
};

requireLogin(remainderQueries, 'tagDetail');
checkPermission(remainderQueries, 'remainders', 'showTags', []);

export default remainderQueries;
