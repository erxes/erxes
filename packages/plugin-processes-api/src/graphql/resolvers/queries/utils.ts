import { IOverallWork } from './../../../models/definitions/overallWorks';
import {
  sendProductsMessage,
  sendInventoriesMessage
} from '../../../messageBroker';

export const needProductsData = async (
  subdomain: string,
  overallWork: IOverallWork
) => {
  const { needProducts } = overallWork;

  const needProductsData: any = needProducts;
  const productIds = needProductsData.map(np => np.productId);

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

  const reserveRems = await sendInventoriesMessage({
    subdomain,
    action: 'reserveRemainders.find',
    data: {
      productIds,
      branchId: overallWork.key.inBranchId,
      departmentId: overallWork.key.inDepartmentId
    },
    isRPC: true,
    defaultValue: []
  });

  const reserveRemByProductId = {};
  for (const rem of reserveRems) {
    reserveRemByProductId[rem.productId] = rem.remainder;
  }

  const liveRems = await sendInventoriesMessage({
    subdomain,
    action: 'remainders',
    data: {
      productIds,
      branchId: overallWork.key.inBranchId,
      departmentId: overallWork.key.inDepartmentId
    },
    isRPC: true,
    defaultValue: []
  });

  const liveRemByProductId = {};
  for (const rem of liveRems) {
    liveRemByProductId[rem.productId] = rem.count;
  }

  const result: any[] = [];
  for (const data of needProductsData) {
    result.push({
      productId: data.productId,
      uomId: data.uomId,
      quantity: data.quantity,
      reserveRem: reserveRemByProductId[data.productId] || 0,
      liveRem: liveRemByProductId[data.productId] || 0,
      product: productById[data.productId]
    });
  }

  return result;
};

export const resultProductsData = async (
  subdomain: string,
  overallWork: IOverallWork
) => {
  const { resultProducts } = overallWork;

  const resultProductsData: any = resultProducts;
  const productIds = resultProductsData.map(np => np.productId);

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

  const reserveRems = await sendInventoriesMessage({
    subdomain,
    action: 'reserveRemainders.find',
    data: {
      productIds,
      branchId: overallWork.key.outBranchId,
      departmentId: overallWork.key.outDepartmentId
    },
    isRPC: true,
    defaultValue: []
  });

  const reserveRemByProductId = {};
  for (const rem of reserveRems) {
    reserveRemByProductId[rem.productId] = rem.remainder;
  }

  const liveRems = await sendInventoriesMessage({
    subdomain,
    action: 'remainders',
    data: {
      productIds,
      branchId: overallWork.key.outBranchId,
      departmentId: overallWork.key.outDepartmentId
    },
    isRPC: true,
    defaultValue: []
  });

  const liveRemByProductId = {};
  for (const rem of liveRems) {
    liveRemByProductId[rem.productId] = rem.count;
  }

  const result: any[] = [];
  for (const data of resultProductsData) {
    result.push({
      productId: data.productId,
      uomId: data.uomId,
      quantity: data.quantity,
      reserveRem: reserveRemByProductId[data.productId] || 0,
      liveRem: liveRemByProductId[data.productId] || 0,
      product: productById[data.productId]
    });
  }

  return result;
};
