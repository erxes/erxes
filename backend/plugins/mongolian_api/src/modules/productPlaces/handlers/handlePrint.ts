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

  const branchIds = productsData.map((pd) => pd.branchId).filter(Boolean);
  let branchById: Record<string, any> = {};
  if (branchIds.length) {
    const branches = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'branches',
      action: 'find',
      method: 'query',
      input: { _id: { $in: branchIds } },
    });
    for (const branch of branches) {
      branchById[branch._id] = branch;
    }
  }

  const departmentIds = productsData
    .map((pd) => pd.departmentId)
    .filter(Boolean);
  let departmentById: Record<string, any> = {};
  if (departmentIds.length) {
    const departments = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'departments',
      action: 'find',
      method: 'query',
      input: { _id: { $in: departmentIds } },
    });
    for (const department of departments) {
      departmentById[department._id] = department;
    }
  }

  const content: any[] = [];

  // If no conditions, treat as a single condition that includes all products
  if (!printConfig.conditions || printConfig.conditions.length === 0) {
    content.push({
      branchId: null,
      branch: null,
      departmentId: null,
      department: null,
      date: new Date(),
      name: deal.name,
      number: deal.number,
      customerCode,
      customerName,
      pDatas: productsData.map((fd) => ({
        ...fd,
        product: productById[fd.productId],
      })),
      amount: productsData.reduce((sum, i) => sum + i.amount, 0),
      headerText: printConfig.headerText,
      footerText: printConfig.footerText,
    });
  } else {
    // Normal filtering by conditions – treat empty string in condition as match when product field is falsy
    for (const condition of printConfig.conditions) {
      const filteredData = productsData.filter(
        (pd) =>
          (condition.branchId === ''
            ? !pd.branchId
            : pd.branchId === condition.branchId) &&
          (condition.departmentId === ''
            ? !pd.departmentId
            : pd.departmentId === condition.departmentId),
      );

      if (!filteredData.length) continue;

      content.push({
        branchId: condition.branchId || null,
        branch: condition.branchId ? branchById[condition.branchId] : null,
        departmentId: condition.departmentId || null,
        department: condition.departmentId
          ? departmentById[condition.departmentId]
          : null,
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
        headerText: printConfig.headerText,
        footerText: printConfig.footerText,
      });
    }
  }

  if (!content.length) {
    return;
  }

  await graphqlPubsub.publish(`productPlacesResponded:${user._id}`, {
    productPlacesResponded: {
      userId: user._id,
      responseId: deal._id,
      sessionCode: user.sessionCode || '',
      content: JSON.stringify(content),
    },
  });
};
