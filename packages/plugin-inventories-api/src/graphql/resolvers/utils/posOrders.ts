import { getPureDate } from '@erxes/api-utils/src/core';
import { sendPosMessage } from '../../../messageBroker';

export const getPosOrders = async (
  subdomain,
  params,
  result,
  branch,
  department,
  productById,
  beProductIds
) => {
  const { endDate, beginDate, branchId, departmentId, isDetailed } = params;
  const bDate = getPureDate(beginDate);
  const eDate = getPureDate(endDate);

  const ordersC1 = await sendPosMessage({
    subdomain,
    action: 'orders.aggregate',
    data: {
      aggregate: [
        {
          $match: {
            paidDate: { $lt: bDate },
            branchId,
            departmentId,
            'items.productId': { $in: beProductIds },
            'returnInfo.returnAt': { $exists: false }
          }
        },
        { $unwind: '$items' },
        { $match: { 'items.productId': { $in: beProductIds } } },
        {
          $group: {
            _id: {
              branchId: '$branchId',
              departmentId: '$departmentId',
              productId: '$items.productId'
            },
            count: { $sum: '$items.count' }
          }
        }
      ],
      replacers: [
        'aggregate[0].$match.paidDate.$lt = new Date(aggregate[0].$match.paidDate.$lt)'
      ]
    },
    isRPC: true,
    defaultValue: []
  });

  const ordersReturnC1 = await sendPosMessage({
    subdomain,
    action: 'orders.aggregate',
    data: {
      aggregate: [
        {
          $match: {
            'returnInfo.returnAt': { $lt: bDate },
            branchId,
            departmentId,
            'items.productId': { $in: beProductIds }
          }
        },
        { $unwind: '$items' },
        { $match: { 'items.productId': { $in: beProductIds } } },
        {
          $group: {
            _id: {
              branchId: '$branchId',
              departmentId: '$departmentId',
              productId: '$items.productId'
            },
            count: { $sum: '$items.count' }
          }
        }
      ],
      replacers: [
        'aggregate[0].$match["returnInfo.returnAt"].$lt = new Date(aggregate[0].$match["returnInfo.returnAt"].$lt)'
      ]
    },
    isRPC: true,
    defaultValue: []
  });

  const ordersBetween = await sendPosMessage({
    subdomain,
    action: 'orders.aggregate',
    data: {
      aggregate: [
        {
          $match: {
            paidDate: { $gte: bDate, $lte: eDate },
            branchId,
            departmentId,
            'items.productId': { $in: beProductIds },
            'returnInfo.returnAt': { $exists: false }
          }
        },
        { $unwind: '$items' },
        { $match: { 'items.productId': { $in: beProductIds } } },
        {
          $group: {
            _id: {
              branchId: '$branchId',
              departmentId: '$departmentId',
              productId: '$items.productId'
            },
            count: { $sum: '$items.count' },
            performs: { $push: '$$ROOT' }
          }
        }
      ],
      replacers: [
        'aggregate[0].$match.paidDate.$gte = new Date(aggregate[0].$match.paidDate.$gte)',
        'aggregate[0].$match.paidDate.$lte = new Date(aggregate[0].$match.paidDate.$lte)'
      ]
    },
    isRPC: true,
    defaultValue: []
  });

  const ordersReturnBetween = await sendPosMessage({
    subdomain,
    action: 'orders.aggregate',
    data: {
      aggregate: [
        {
          $match: {
            'returnInfo.returnAt': { $gte: bDate, $lte: eDate },
            branchId,
            departmentId,
            'items.productId': { $in: beProductIds }
          }
        },
        { $unwind: '$items' },
        { $match: { 'items.productId': { $in: beProductIds } } },
        {
          $group: {
            _id: {
              branchId: '$branchId',
              departmentId: '$departmentId',
              productId: '$items.productId'
            },
            count: { $sum: '$items.count' },
            performs: { $push: '$$ROOT' }
          }
        }
      ],
      replacers: [
        'aggregate[0].$match["returnInfo.returnAt"].$gte = new Date(aggregate[0].$match["returnInfo.returnAt"].$gte)',
        'aggregate[0].$match["returnInfo.returnAt"].$lte = new Date(aggregate[0].$match["returnInfo.returnAt"].$lte)'
      ]
    },
    isRPC: true,
    defaultValue: []
  });

  const defaultVal = {
    begin: 0,
    receipt: 0,
    spend: 0,
    end: 0,
    performs: []
  };

  for (const row of ordersC1) {
    const { branchId, departmentId, productId } = row._id;
    if (!result[branchId]) {
      result[branchId] = {
        branch: `${branch.code} - ${branch.title}`,
        values: {}
      };
    }

    if (!result[branchId].values[departmentId]) {
      result[branchId].values[departmentId] = {
        department: `${department.code}- ${department.title}`,
        values: {}
      };
    }

    if (!result[branchId].values[departmentId].values[productId]) {
      result[branchId].values[departmentId].values[productId] = {
        product: `${(productById[productId] || {}).code} - ${
          (productById[productId] || {}).name
        }`,
        values: { ...defaultVal }
      };
    }

    result[branchId].values[departmentId].values[productId].values.begin -=
      row.count;
    result[branchId].values[departmentId].values[productId].values.end -=
      row.count;
  }

  for (const row of ordersReturnC1) {
    const { branchId, departmentId, productId } = row._id;
    if (!result[branchId]) {
      result[branchId] = {
        branch: `${branch.code} - ${branch.title}`,
        values: {}
      };
    }

    if (!result[branchId].values[departmentId]) {
      result[branchId].values[departmentId] = {
        department: `${department.code}- ${department.title}`,
        values: {}
      };
    }

    if (!result[branchId].values[departmentId].values[productId]) {
      result[branchId].values[departmentId].values[productId] = {
        product: `${(productById[productId] || {}).code} - ${
          (productById[productId] || {}).name
        }`,
        values: { ...defaultVal }
      };
    }

    result[branchId].values[departmentId].values[productId].values.begin +=
      row.count;
    result[branchId].values[departmentId].values[productId].values.end +=
      row.count;
  }

  for (const row of ordersBetween) {
    const { branchId, departmentId, productId } = row._id;

    if (!result[branchId]) {
      result[branchId] = {
        branch: `${branch.code} - ${branch.title}`,
        values: {}
      };
    }

    if (!result[branchId].values[departmentId]) {
      result[branchId].values[departmentId] = {
        department: `${department.code}- ${department.title}`,
        values: {}
      };
    }

    if (!result[branchId].values[departmentId].values[productId]) {
      result[branchId].values[departmentId].values[productId] = {
        product: `${(productById[productId] || {}).code} - ${
          (productById[productId] || {}).name
        }`,
        values: { ...defaultVal }
      };
    }

    result[branchId].values[departmentId].values[productId].values.spend +=
      row.count;
    result[branchId].values[departmentId].values[productId].values.end -=
      row.count;

    if (isDetailed) {
      result[branchId].values[departmentId].values[
        productId
      ].values.performs = result[branchId].values[departmentId].values[
        productId
      ].values.performs.concat(
        (row.performs || []).map(p => ({
          ...p,
          date: p.paidDate,
          spec: p.number,
          item: { receipt: 0, spend: p.items.count }
        }))
      );
    }
  }

  for (const row of ordersReturnBetween) {
    const { branchId, departmentId, productId } = row._id;

    if (!result[branchId]) {
      result[branchId] = {
        branch: `${branch.code} - ${branch.title}`,
        values: {}
      };
    }

    if (!result[branchId].values[departmentId]) {
      result[branchId].values[departmentId] = {
        department: `${department.code}- ${department.title}`,
        values: {}
      };
    }

    if (!result[branchId].values[departmentId].values[productId]) {
      result[branchId].values[departmentId].values[productId] = {
        product: `${(productById[productId] || {}).code} - ${
          (productById[productId] || {}).name
        }`,
        values: { ...defaultVal }
      };
    }

    result[branchId].values[departmentId].values[productId].values.receipt +=
      row.count;
    result[branchId].values[departmentId].values[productId].values.end +=
      row.count;

    if (isDetailed) {
      result[branchId].values[departmentId].values[
        productId
      ].values.performs = result[branchId].values[departmentId].values[
        productId
      ].values.performs.concat(
        (row.performs || []).map(p => ({
          ...p,
          date: p.paidDate,
          spec: `${p.number} (return)`,
          item: { receipt: p.items.count, spend: 0 }
        }))
      );
    }
  }

  return result;
};
