import {
  GetExportData,
  GetExportDataArgs,
  IImportExportContext,
  buildExportCursorQuery,
  normalizeExportLimit,
} from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { generateFilter } from '~/modules/sales/graphql/resolvers/queries/deals';
import { buildDealExportRow } from './buildDealExportRow';

const asArray = (value: unknown, label: string): any[] => {
  if (value === null || value === undefined) {
    throw new Error(`${label} lookup did not return a response`);
  }

  if (!Array.isArray(value)) {
    throw new Error(`${label} lookup returned an invalid response`);
  }

  return value;
};

const uniq = (values: Array<string | undefined>) => [
  ...new Set(values.filter(Boolean) as string[]),
];

const includesAnyField = (
  selectedFields: string[] | undefined,
  fields: string[],
) => {
  if (!selectedFields?.length) {
    return true;
  }

  return fields.some((field) => selectedFields.includes(field));
};

const fetchCoreArray = async ({
  subdomain,
  module,
  action = 'find',
  input,
  label,
}: {
  subdomain: string;
  module: string;
  action?: string;
  input: any;
  label: string;
}) => {
  const response = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module,
    action,
    input,
  });

  return asArray(response, label);
};

const getUserName = (user: any) => {
  return (
    user?.details?.fullName ||
    user?.email ||
    user?.username ||
    user?.employeeId ||
    user?._id ||
    ''
  );
};

const getCustomerName = (customer: any) => {
  return (
    [customer?.firstName, customer?.middleName, customer?.lastName]
      .filter(Boolean)
      .join(' ') ||
    customer?.primaryEmail ||
    customer?.primaryPhone ||
    customer?.code ||
    customer?._id ||
    ''
  );
};

const getCompanyName = (company: any) => {
  return (
    company?.primaryName ||
    company?.names?.[0] ||
    company?.primaryEmail ||
    company?.primaryPhone ||
    company?.code ||
    company?._id ||
    ''
  );
};

const buildNameMap = (
  docs: any[],
  formatter: (doc: any) => string,
): Map<string, string> => {
  const map = new Map<string, string>();

  for (const doc of docs) {
    if (doc?._id) {
      map.set(String(doc._id), formatter(doc));
    }
  }

  return map;
};

const buildRelationMap = (
  relations: any[],
): {
  relationMap: Map<string, { customerIds: string[]; companyIds: string[] }>;
  customerIds: string[];
  companyIds: string[];
} => {
  const relationMap = new Map<
    string,
    { customerIds: string[]; companyIds: string[] }
  >();
  const customerIds = new Set<string>();
  const companyIds = new Set<string>();

  for (const relation of relations) {
    const dealEntity = relation.entities?.find(
      (entity: any) => entity.contentType === 'sales:deal',
    );

    if (!dealEntity?.contentId) {
      continue;
    }

    const mapValue = relationMap.get(dealEntity.contentId) || {
      customerIds: [],
      companyIds: [],
    };

    for (const entity of relation.entities || []) {
      if (entity.contentType === 'core:customer' && entity.contentId) {
        mapValue.customerIds.push(entity.contentId);
        customerIds.add(entity.contentId);
      }

      if (entity.contentType === 'core:company' && entity.contentId) {
        mapValue.companyIds.push(entity.contentId);
        companyIds.add(entity.contentId);
      }
    }

    relationMap.set(dealEntity.contentId, {
      customerIds: uniq(mapValue.customerIds),
      companyIds: uniq(mapValue.companyIds),
    });
  }

  return {
    relationMap,
    customerIds: Array.from(customerIds),
    companyIds: Array.from(companyIds),
  };
};

export async function getDealExportData(
  args: GetExportDataArgs,
  { models, subdomain }: IImportExportContext<IModels>,
): Promise<Record<string, any>[]> {
  const {
    cursor,
    limit,
    filters,
    ids,
    selectedFields,
    userId,
  } = (args?.data ?? args) as GetExportData;
  const effectiveLimit = normalizeExportLimit(limit, 5000);

  if (!models) {
    throw new Error('Models not available in context');
  }

  if (filters && !userId) {
    throw new Error('Export userId is required for filtered deal exports');
  }

  const filter = filters
    ? await generateFilter(models, subdomain, userId as string, filters)
    : {};

  const { query: exportQuery, isIdsMode } = buildExportCursorQuery({
    baseQuery: filter,
    cursor,
    ids,
    limit: effectiveLimit,
  });

  if (isIdsMode && exportQuery._id?.$in?.length === 0) {
    return [];
  }

  const deals = await models.Deals.find(exportQuery)
    .sort({ _id: 1 })
    .limit(effectiveLimit)
    .lean();

  if (!deals.length) {
    return [];
  }

  const dealIds = deals.map((deal) => String(deal._id));
  const stageIds = uniq(deals.map((deal) => deal.stageId));
  const labelIds = uniq(deals.flatMap((deal) => deal.labelIds || []));
  const needsUsers = includesAnyField(selectedFields, [
    'assignedUsers',
    'owner',
  ]);
  const needsTags = includesAnyField(selectedFields, ['tags']);
  const needsBranches = includesAnyField(selectedFields, ['branches']);
  const needsDepartments = includesAnyField(selectedFields, ['departments']);
  const needsProducts = includesAnyField(selectedFields, ['products']);
  const needsRelations = includesAnyField(selectedFields, [
    'customers',
    'customerIds',
    'companies',
    'companyIds',
  ]);
  const userIds = needsUsers
    ? uniq(
        deals.flatMap((deal) => [
          deal.userId,
          ...(deal.assignedUserIds || []),
        ]),
      )
    : [];
  const tagIds = needsTags
    ? uniq(deals.flatMap((deal) => deal.tagIds || []))
    : [];
  const branchIds = needsBranches
    ? uniq(deals.flatMap((deal) => deal.branchIds || []))
    : [];
  const departmentIds = needsDepartments
    ? uniq(deals.flatMap((deal) => deal.departmentIds || []))
    : [];
  const productIds = needsProducts
    ? uniq(
        deals.flatMap((deal) =>
          (deal.productsData || []).map((productData) => productData.productId),
        ),
      )
    : [];

  const stages = await models.Stages.find({ _id: { $in: stageIds } }).lean();
  const pipelineIds = uniq(stages.map((stage) => stage.pipelineId));
  const pipelines = await models.Pipelines.find({
    _id: { $in: pipelineIds },
  }).lean();
  const labels = await models.PipelineLabels.find({
    _id: { $in: labelIds },
  }).lean();

  const [relations, users, tags, branches, departments, products] =
    await Promise.all([
      needsRelations
        ? fetchCoreArray({
            subdomain,
            module: 'relation',
            action: 'filterRelations',
            input: {
              contentType: 'sales:deal',
              contentIds: dealIds,
              relatedContentType: 'core:customer',
            },
            label: 'Customer relation',
          }).then(async (customerRelations) => {
            const companyRelations = await fetchCoreArray({
              subdomain,
              module: 'relation',
              action: 'filterRelations',
              input: {
                contentType: 'sales:deal',
                contentIds: dealIds,
                relatedContentType: 'core:company',
              },
              label: 'Company relation',
            });

            return [...customerRelations, ...companyRelations];
          })
        : [],
      userIds.length
        ? fetchCoreArray({
            subdomain,
            module: 'users',
            input: {
              query: { _id: { $in: userIds } },
              fields: {
                _id: 1,
                email: 1,
                username: 1,
                employeeId: 1,
                details: 1,
              },
            },
            label: 'Users',
          })
        : [],
      tagIds.length
        ? fetchCoreArray({
            subdomain,
            module: 'tags',
            input: {
              query: { _id: { $in: tagIds } },
              fields: { _id: 1, name: 1 },
            },
            label: 'Tags',
          })
        : [],
      branchIds.length
        ? fetchCoreArray({
            subdomain,
            module: 'branches',
            input: {
              query: { _id: { $in: branchIds } },
              fields: { _id: 1, title: 1 },
            },
            label: 'Branches',
          })
        : [],
      departmentIds.length
        ? fetchCoreArray({
            subdomain,
            module: 'departments',
            input: {
              query: { _id: { $in: departmentIds } },
              fields: { _id: 1, title: 1 },
            },
            label: 'Departments',
          })
        : [],
      productIds.length
        ? fetchCoreArray({
            subdomain,
            module: 'products',
            input: {
              query: { _id: { $in: productIds } },
              fields: { _id: 1, name: 1, code: 1 },
            },
            label: 'Products',
          })
        : [],
    ]);

  const { relationMap, customerIds, companyIds } = buildRelationMap(relations);

  const [customers, companies] = await Promise.all([
    customerIds.length
      ? fetchCoreArray({
          subdomain,
          module: 'customers',
          input: { query: { _id: { $in: customerIds } } },
          label: 'Customers',
        })
      : [],
    companyIds.length
      ? fetchCoreArray({
          subdomain,
          module: 'companies',
          input: { query: { _id: { $in: companyIds } } },
          label: 'Companies',
        })
      : [],
  ]);

  const stageMap = new Map<string, any>(
    stages.map((stage) => [String(stage._id), stage]),
  );
  const pipelineMap = new Map<string, any>(
    pipelines.map((pipeline) => [String(pipeline._id), pipeline]),
  );
  const labelMap = new Map<string, string>(
    labels.map((label) => [String(label._id), label.name || '']),
  );
  const userMap = buildNameMap(users, getUserName);
  const tagMap = buildNameMap(tags, (tag) => tag.name || tag._id);
  const branchMap = buildNameMap(
    branches,
    (branch) => branch.title || branch._id,
  );
  const departmentMap = buildNameMap(
    departments,
    (department) => department.title || department._id,
  );
  const productMap = buildNameMap(
    products,
    (product) => product.name || product.code || product._id,
  );
  const customerMap = buildNameMap(customers, getCustomerName);
  const companyMap = buildNameMap(companies, getCompanyName);

  return deals.map((deal) =>
    buildDealExportRow(deal, selectedFields, {
      stageMap,
      pipelineMap,
      labelMap,
      userMap,
      tagMap,
      branchMap,
      departmentMap,
      productMap,
      customerMap,
      companyMap,
      relationMap,
    }),
  );
}
