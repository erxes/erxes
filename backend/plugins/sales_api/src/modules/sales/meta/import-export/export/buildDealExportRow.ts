type RelatedMaps = {
  stageMap: Map<string, any>;
  pipelineMap: Map<string, any>;
  boardMap: Map<string, any>;
  labelMap: Map<string, string>;
  userMap: Map<string, string>;
  tagMap: Map<string, string>;
  branchMap: Map<string, string>;
  departmentMap: Map<string, string>;
  productMap: Map<string, any>;
  customerMap: Map<string, string>;
  customerDocMap: Map<string, any>;
  companyMap: Map<string, string>;
  companyDocMap: Map<string, any>;
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
  productMap: Map<string, any>,
) => {
  return (productsData || [])
    .map((productData) => {
      const product = productMap.get(String(productData.productId));
      const productName =
        productData.name ||
        product?.name ||
        product?.code ||
        productData.productId ||
        '';
      const quantity = productData.quantity
        ? ` (${productData.quantity}${
            productData.uom ? ` ${productData.uom}` : ''
          })`
        : '';
      const amount = productData.amount ? ` - ${productData.amount}` : '';

      return `${productName}${quantity}${amount}`;
    })
    .filter(Boolean)
    .join('; ');
};

const getCustomerEmail = (customer: any) =>
  customer?.primaryEmail || customer?.emails?.[0]?.email || '';

const getCustomerPhone = (customer: any) =>
  customer?.primaryPhone || customer?.phones?.[0]?.phone || '';

const getCompanyName = (company: any) =>
  company?.primaryName || company?.names?.[0] || company?._id || '';

const getCustomFieldValue = (deal: any, fieldId: string) => {
  const customField = (deal.customFieldsData || []).find(
    (field: any) => field.field === fieldId,
  );

  const value = customField?.value;

  if (Array.isArray(value)) {
    return value.join(', ');
  }

  return value ?? '';
};

const hasProductColumn = (selectedFields: string[] | undefined) => {
  if (!selectedFields?.length) {
    return true;
  }

  return selectedFields.some((field) => field.startsWith('productsData.'));
};

const getProductFieldValue = (
  productData: any,
  field: string,
  maps: RelatedMaps,
) => {
  const product = maps.productMap.get(String(productData.productId));

  switch (field) {
    case 'productsData.name':
      return productData.name || product?.name || productData.productId || '';
    case 'productsData.code':
      return product?.code || '';
    case 'productsData.branch':
      return productData.branchId
        ? maps.branchMap.get(String(productData.branchId)) ||
            productData.branchId
        : '';
    case 'productsData.department':
      return productData.departmentId
        ? maps.departmentMap.get(String(productData.departmentId)) ||
            productData.departmentId
        : '';
    case 'productsData.tickUsed':
      return productData.tickUsed ? 'TRUE' : 'FALSE';
    default: {
      const key = field.replace('productsData.', '');
      return productData[key] ?? '';
    }
  }
};

const pickSelectedFields = (
  allFields: Record<string, any>,
  selectedFields: string[] | undefined,
) => {
  if (!selectedFields?.length) {
    return allFields;
  }

  const row: Record<string, any> = { _id: allFields._id };

  for (const field of selectedFields) {
    row[field] = allFields[field] ?? '';
  }

  return row;
};

export const buildDealExportRows = (
  deal: any,
  selectedFields: string[] | undefined,
  maps: RelatedMaps,
): Record<string, any>[] => {
  const stage = maps.stageMap.get(String(deal.stageId));
  const pipeline = stage?.pipelineId
    ? maps.pipelineMap.get(String(stage.pipelineId))
    : undefined;
  const board = pipeline?.boardId
    ? maps.boardMap.get(String(pipeline.boardId))
    : undefined;
  const initialStage = deal.initialStageId
    ? maps.stageMap.get(String(deal.initialStageId))
    : undefined;
  const relations = maps.relationMap.get(String(deal._id)) || {
    customerIds: [],
    companyIds: [],
  };
  const customerDocs = relations.customerIds
    .map((id) => maps.customerDocMap.get(String(id)))
    .filter(Boolean);
  const companyDocs = relations.companyIds
    .map((id) => maps.companyDocMap.get(String(id)))
    .filter(Boolean);

  const allFields: Record<string, any> = {
    _id: String(deal._id || ''),
    number: deal.number || '',
    name: deal.name || '',
    boardName: board?.name || '',
    pipeline: pipeline?.name || '',
    pipelineName: pipeline?.name || '',
    stage: stage?.name || '',
    stageName: stage?.name || '',
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
    modifiedAt: formatDate(deal.updatedAt || deal.modifiedAt),
    stageId: deal.stageId || '',
    pipelineId: stage?.pipelineId || '',
    boardId: pipeline?.boardId || '',
    initialStage: initialStage?.name || '',
    initialStageId: deal.initialStageId || '',
    assignedUsers: joinNames(deal.assignedUserIds, maps.userMap),
    assignedUserIds: (deal.assignedUserIds || []).join('; '),
    watchedUsers: joinNames(deal.watchedUserIds, maps.userMap),
    watchedUserIds: (deal.watchedUserIds || []).join('; '),
    owner: deal.userId
      ? maps.userMap.get(String(deal.userId)) || deal.userId
      : '',
    userId: deal.userId || '',
    modifiedBy: deal.modifiedBy
      ? maps.userMap.get(String(deal.modifiedBy)) || deal.modifiedBy
      : '',
    customers: joinNames(relations.customerIds, maps.customerMap),
    customersEmail: customerDocs
      .map(getCustomerEmail)
      .filter(Boolean)
      .join('; '),
    customersName: joinNames(relations.customerIds, maps.customerMap),
    customersPhone: customerDocs
      .map(getCustomerPhone)
      .filter(Boolean)
      .join('; '),
    customerIds: relations.customerIds.join('; '),
    companies:
      joinNames(relations.companyIds, maps.companyMap) ||
      companyDocs.map(getCompanyName).filter(Boolean).join('; '),
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
    totalLabelCount: (deal.labelIds || []).length,
  };

  for (const customField of deal.customFieldsData || []) {
    if (customField?.field) {
      allFields[`customFieldsData.${customField.field}`] = getCustomFieldValue(
        deal,
        customField.field,
      );
    }
  }

  const shouldExpandProducts =
    hasProductColumn(selectedFields) && (deal.productsData || []).length > 0;

  if (!shouldExpandProducts) {
    return [pickSelectedFields(allFields, selectedFields)];
  }

  return (deal.productsData || []).map((productData: any, index: number) => {
    const productFields: Record<string, any> = {};
    const fields = selectedFields?.length
      ? selectedFields.filter((field) => field.startsWith('productsData.'))
      : [
          'productsData.name',
          'productsData.code',
          'productsData.amount',
          'productsData.discount',
          'productsData.discountPercent',
          'productsData.currency',
          'productsData.tax',
          'productsData.taxPercent',
          'productsData.quantity',
          'productsData.unitPrice',
          'productsData.tickUsed',
          'productsData.isVatApplied',
          'productsData.branch',
          'productsData.department',
          'productsData.maxQuantity',
        ];

    for (const field of fields) {
      productFields[field] = getProductFieldValue(productData, field, maps);
    }

    return pickSelectedFields(
      index === 0 ? { ...allFields, ...productFields } : productFields,
      selectedFields,
    );
  });
};
