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
  const { endDate, beginDate, branchId, departmentId } = params;

  const bDate = new Date(beginDate);
  const eDate = new Date(endDate);

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

    result[inBranchId].values[inDepartmentId].values[productId].values.begin +=
      row.count;
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
    result[outBranchId].values[outDepartmentId].values[productId].values.end -=
      row.count;
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

    result[outBranchId].values[outDepartmentId].values[productId].values.out +=
      outProducts.quantity;
    result[outBranchId].values[outDepartmentId].values[productId].values.end -=
      outProducts.quantity;
    result[outBranchId].values[outDepartmentId].values[
      productId
    ].values.performs.push(row);
  }

  return result;
};
