import { getPureDate } from '@erxes/api-utils/src/core';
import { sendProcessesMessage } from '../../../messageBroker';

export const getProcesses = async (
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
    isRPC: true,
    defaultValue: []
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
    isRPC: true,
    defaultValue: []
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
        { $match: { 'inProducts.productId': { $in: beProductIds } } },
        {
          $group: {
            _id: {
              inBranchId: '$inBranchId',
              inDepartmentId: '$inDepartmentId',
              productId: '$inProducts.productId'
            },
            count: { $sum: '$inProducts.quantity' },
            performs: { $push: '$$ROOT' }
          }
        }
      ],
      replacers: [
        'aggregate[0].$match.endAt.$gte = new Date(aggregate[0].$match.endAt.$gte)',
        'aggregate[0].$match.endAt.$lte = new Date(aggregate[0].$match.endAt.$lte)'
      ]
    },
    isRPC: true,
    defaultValue: []
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
        { $match: { 'outProducts.productId': { $in: beProductIds } } },
        {
          $group: {
            _id: {
              outBranchId: '$outBranchId',
              outDepartmentId: '$outDepartmentId',
              productId: '$outProducts.productId'
            },
            count: { $sum: '$outProducts.quantity' },
            performs: { $push: '$$ROOT' }
          }
        }
      ],
      replacers: [
        'aggregate[0].$match.endAt.$gte = new Date(aggregate[0].$match.endAt.$gte)',
        'aggregate[0].$match.endAt.$lte = new Date(aggregate[0].$match.endAt.$lte)'
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
        values: { ...defaultVal }
      };
    }

    result[inBranchId].values[inDepartmentId].values[productId].values.begin -=
      row.count;
    result[inBranchId].values[inDepartmentId].values[productId].values.end -=
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
        values: { ...defaultVal }
      };
    }

    result[outBranchId].values[outDepartmentId].values[
      productId
    ].values.begin += row.count;
    result[outBranchId].values[outDepartmentId].values[productId].values.end +=
      row.count;
  }

  for (const row of performsBetIn) {
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
        values: { ...defaultVal }
      };
    }

    result[inBranchId].values[inDepartmentId].values[productId].values.spend +=
      row.count;
    result[inBranchId].values[inDepartmentId].values[productId].values.end -=
      row.count;

    if (isDetailed) {
      result[inBranchId].values[inDepartmentId].values[
        productId
      ].values.performs = result[inBranchId].values[inDepartmentId].values[
        productId
      ].values.performs.concat(
        (row.performs || []).map(p => ({
          ...p,
          date: p.endAt,
          spec: p.description,
          item: {
            spend: p.inProducts.quantity,
            receipt: p.outProducts.quantity
          }
        }))
      );
    }
  }

  for (const row of performsBetOut) {
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
        values: { ...defaultVal }
      };
    }

    result[outBranchId].values[outDepartmentId].values[
      productId
    ].values.receipt += row.count;
    result[outBranchId].values[outDepartmentId].values[productId].values.end +=
      row.count;

    if (isDetailed) {
      result[outBranchId].values[outDepartmentId].values[
        productId
      ].values.performs = result[outBranchId].values[outDepartmentId].values[
        productId
      ].values.performs.concat(
        (row.performs || []).map(p => ({
          ...p,
          date: p.endAt,
          spec: p.description,
          item: {
            spend: p.inProducts.quantity,
            receipt: p.outProducts.quantity
          }
        }))
      );
    }
  }

  return result;
};
