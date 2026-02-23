import { graphqlPubsub, sendTRPCMessage } from 'erxes-api-shared/utils';
import { getCustomer } from '../utils/utils';

export const handlePrint = async (
  subdomain,
  deal,
  user,
  productsData,
  printConfig,
  productById,
) => {
  const { customerCode, customerName } = await getCustomer(subdomain, deal);

  const branchIds = productsData.map((pd) => pd.branchId);
  const branches = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'branches',
    action: 'find',
    method: 'query',
    input: {
      query: { _id: { $in: branchIds } },
    },
  });

  const branchById: Record<string, any> = {};
  for (const branch of branches) {
    branchById[branch._id] = branch;
  }

  const departmentIds = productsData.map((pd) => pd.departmentId);
  const departments = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'departments',
    action: 'find',
    method: 'query',
    input: {
      _id: { $in: departmentIds },
    },
  });

  const departmentById: Record<string, any> = {};
  for (const department of departments) {
    departmentById[department._id] = department;
  }

  const content: any[] = [];

  for (const condition of printConfig.conditions) {
    const filteredData = productsData.filter(
      (pd) =>
        pd.branchId === condition.branchId &&
        pd.departmentId === condition.departmentId,
    );

    if (!filteredData.length) {
      continue;
    }

    content.push({
      branchId: condition.branchId,
      branch: branchById[condition.branchId],
      departmentId: condition.departmentId,
      department: departmentById[condition.departmentId],
      date: new Date(),
      name: deal.name,
      number: deal.number,
      customerCode,
      customerName,
      pDatas: filteredData.map((fd) => ({
        ...fd,
        product: productById[fd.productId],
      })),
      amount: filteredData.reduce((sum, i) => sum + i.amount, 0),
    });
  }

  if (!content.length) {
    return;
  }

  await graphqlPubsub.publish(`productPlacesResponded:${user._id}`, {
    productPlacesResponded: {
      userId: user._id,
      responseId: deal._id,
      sessionCode: user.sessionCode || '',
      content,
    },
  });
};
