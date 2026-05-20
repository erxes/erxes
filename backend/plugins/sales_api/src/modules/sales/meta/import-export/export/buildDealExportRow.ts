type RelatedMaps = {
  stageMap: Map<string, any>;
  pipelineMap: Map<string, any>;
  labelMap: Map<string, string>;
  userMap: Map<string, string>;
  tagMap: Map<string, string>;
  branchMap: Map<string, string>;
  departmentMap: Map<string, string>;
  productMap: Map<string, string>;
  customerMap: Map<string, string>;
  companyMap: Map<string, string>;
  relationMap: Map<string, { customerIds: string[]; companyIds: string[] }>;
};

const formatDate = (value: unknown) => {
  if (!value) {
    return '';
  }

  const date = new Date(String(value));

  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
};

const joinNames = (
  ids: string[] | undefined,
  nameMap: Map<string, string>,
): string => {
  return (ids || [])
    .map((id) => nameMap.get(String(id)) || String(id))
    .filter(Boolean)
    .join('; ');
};

const serializeProducts = (
  productsData: any[] | undefined,
  productMap: Map<string, string>,
) => {
  return (productsData || [])
    .map((productData) => {
      const productName =
        productData.name ||
        productMap.get(String(productData.productId)) ||
        productData.productId ||
        '';
      const quantity = productData.quantity
        ? ` (${productData.quantity}${productData.uom ? ` ${productData.uom}` : ''})`
        : '';
      const amount = productData.amount ? ` - ${productData.amount}` : '';

      return `${productName}${quantity}${amount}`;
    })
    .filter(Boolean)
    .join('; ');
};

export const buildDealExportRow = (
  deal: any,
  selectedFields: string[] | undefined,
  maps: RelatedMaps,
): Record<string, any> => {
  const stage = maps.stageMap.get(String(deal.stageId));
  const pipeline = stage?.pipelineId
    ? maps.pipelineMap.get(String(stage.pipelineId))
    : undefined;
  const relations = maps.relationMap.get(String(deal._id)) || {
    customerIds: [],
    companyIds: [],
  };

  const allFields: Record<string, any> = {
    _id: String(deal._id || ''),
    number: deal.number || '',
    name: deal.name || '',
    pipeline: pipeline?.name || '',
    stage: stage?.name || '',
    status: deal.status || '',
    priority: deal.priority || '',
    totalAmount: deal.totalAmount ?? '',
    unUsedTotalAmount: deal.unUsedTotalAmount ?? '',
    bothTotalAmount: deal.bothTotalAmount ?? '',
    description: deal.description || '',
    startDate: formatDate(deal.startDate),
    closeDate: formatDate(deal.closeDate),
    createdAt: formatDate(deal.createdAt),
    updatedAt: formatDate(deal.updatedAt),
    stageId: deal.stageId || '',
    pipelineId: stage?.pipelineId || '',
    assignedUsers: joinNames(deal.assignedUserIds, maps.userMap),
    assignedUserIds: (deal.assignedUserIds || []).join('; '),
    owner: deal.userId ? maps.userMap.get(String(deal.userId)) || deal.userId : '',
    userId: deal.userId || '',
    customers: joinNames(relations.customerIds, maps.customerMap),
    customerIds: relations.customerIds.join('; '),
    companies: joinNames(relations.companyIds, maps.companyMap),
    companyIds: relations.companyIds.join('; '),
    labels: joinNames(deal.labelIds, maps.labelMap),
    labelIds: (deal.labelIds || []).join('; '),
    tags: joinNames(deal.tagIds, maps.tagMap),
    tagIds: (deal.tagIds || []).join('; '),
    branches: joinNames(deal.branchIds, maps.branchMap),
    branchIds: (deal.branchIds || []).join('; '),
    departments: joinNames(deal.departmentIds, maps.departmentMap),
    departmentIds: (deal.departmentIds || []).join('; '),
    products: serializeProducts(deal.productsData, maps.productMap),
    productsData: JSON.stringify(deal.productsData || []),
  };

  if (!selectedFields?.length) {
    return allFields;
  }

  const row: Record<string, any> = { _id: allFields._id };

  for (const field of selectedFields) {
    row[field] = allFields[field] ?? '';
  }

  return row;
};
