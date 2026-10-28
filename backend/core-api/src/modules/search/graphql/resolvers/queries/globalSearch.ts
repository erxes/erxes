import { escapeRegExp } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { STRUCTURE_ENTITY_STATUSES } from '@/organization/structure/constants';

type TGlobalSearchItem = {
  id: string;
  title: string;
  description?: string;
  subTitle?: string;
  icon?: string;
  module: string;
  category: string;
  path: string;
  createdAt?: Date;
  matchFields?: Array<{ label: string; value: string }>;
};

const compactMatchFields = (
  fields: Array<{ label: string; value?: unknown }>,
): Array<{ label: string; value: string }> =>
  fields.flatMap(({ label, value }) =>
    typeof value === 'string' && value.trim() ? [{ label, value }] : [],
  );

const getCreatedAt = (value: object): Date | undefined =>
  'createdAt' in value && value.createdAt instanceof Date
    ? value.createdAt
    : undefined;

type TQueryParams = {
  searchValue?: string;
  module?: string;
  limit?: number;
  cursor?: string;
  direction?: 'forward' | 'backward';
  orderBy?: { createdAt?: 1 | -1 };
};

const IDENTIFIER_SEPARATOR = String.raw`[\s\-+()./]*`;

export const buildIdentifierSearchRegex = (
  value: string,
): RegExp | undefined => {
  const characters = value
    .trim()
    .replace(/[\s\-+()./]/g, '')
    .split('')
    .map(escapeRegExp);

  return characters.length
    ? new RegExp(characters.join(IDENTIFIER_SEPARATOR), 'i')
    : undefined;
};

type TDataSource = {
  count: () => Promise<number>;
  fetch: (skip: number, limit: number) => Promise<TGlobalSearchItem[]>;
};

const decodeOffsets = (cursor?: string): number[] => {
  if (!cursor) return [];
  try {
    const data = JSON.parse(Buffer.from(cursor, 'base64').toString());
    return Array.isArray(data.offsets)
      ? data.offsets.map((value: unknown) => Math.max(0, Number(value) || 0))
      : [];
  } catch {
    return [];
  }
};

const encodeOffsets = (offsets: number[]): string =>
  Buffer.from(JSON.stringify({ offsets })).toString('base64');

const compareSearchItems = (
  left: TGlobalSearchItem,
  right: TGlobalSearchItem,
  sortDirection: 1 | -1,
): number => {
  const dateDifference =
    (left.createdAt?.getTime() ?? 0) - (right.createdAt?.getTime() ?? 0);

  return dateDifference === 0
    ? left.id.localeCompare(right.id) * sortDirection
    : dateDifference * sortDirection;
};

const mergeSorted = (
  batches: TGlobalSearchItem[][],
  sourceCount: number,
  limit: number,
  sortDirection: 1 | -1,
): { list: TGlobalSearchItem[]; consumed: number[] } => {
  const merged: TGlobalSearchItem[] = [];
  const position = new Array(sourceCount).fill(0);

  while (merged.length < limit) {
    let selectedSource = -1;
    let selectedItem: TGlobalSearchItem | undefined;

    for (let i = 0; i < sourceCount; i++) {
      const item = batches[i][position[i]];

      if (!item) {
        continue;
      }

      if (
        !selectedItem ||
        compareSearchItems(item, selectedItem, sortDirection) < 0
      ) {
        selectedSource = i;
        selectedItem = item;
      }
    }

    if (selectedSource === -1) {
      break;
    }

    merged.push(batches[selectedSource][position[selectedSource]]);
    position[selectedSource] += 1;
  }

  return { list: merged, consumed: position };
};

const paginateDataSources = async (
  sources: TDataSource[],
  params: TQueryParams,
) => {
  const limit = Math.min(Math.max(params.limit ?? 20, 1), 100);
  const sourceCount = sources.length;
  const offsets = decodeOffsets(params.cursor);
  while (offsets.length < sourceCount) {
    offsets.push(0);
  }

  const batches = await Promise.all(
    sources.map((source, index) => source.fetch(offsets[index], limit)),
  );

  const counts = await Promise.all(sources.map((source) => source.count()));
  const totalCount = counts.reduce((sum, count) => sum + count, 0);

  const sortDirection = params.orderBy?.createdAt === 1 ? 1 : -1;
  const { list, consumed } = mergeSorted(
    batches,
    sourceCount,
    limit,
    sortDirection,
  );
  const nextOffsets = offsets.map((offset, index) => offset + consumed[index]);
  const hasNextPage = nextOffsets.some(
    (offset, index) => offset < counts[index],
  );

  return {
    list,
    totalCount,
    pageInfo: {
      hasNextPage,
      hasPreviousPage: offsets.some((offset) => offset > 0),
      startCursor: list.length > 0 ? encodeOffsets(offsets) : null,
      endCursor: hasNextPage ? encodeOffsets(nextOffsets) : null,
    },
  };
};

export const globalSearchQueries = {
  coreModulesGlobalSearch: async (
    _parent: undefined,
    params: TQueryParams,
    { models }: IContext,
  ) => {
    const sortDirection = params.orderBy?.createdAt === 1 ? 1 : -1;
    const rawSearch = params.searchValue?.trim() ?? '';
    const escapedSearch = escapeRegExp(rawSearch);
    const searchRegex = escapedSearch
      ? new RegExp(escapedSearch, 'i')
      : undefined;
    const identifierRegex = buildIdentifierSearchRegex(rawSearch);

    const customerQuery = searchRegex
      ? {
          status: { $ne: 'deleted' },
          $or: [
            { firstName: searchRegex },
            { lastName: searchRegex },
            { primaryEmail: searchRegex },
            { primaryPhone: identifierRegex ?? searchRegex },
          ],
        }
      : { status: { $ne: 'deleted' } };

    const companyQuery = searchRegex
      ? {
          status: { $ne: 'deleted' },
          $or: [
            { primaryName: searchRegex },
            { primaryEmail: searchRegex },
            { primaryPhone: identifierRegex ?? searchRegex },
          ],
        }
      : { status: { $ne: 'deleted' } };

    const productQuery = searchRegex
      ? {
          status: { $ne: 'deleted' },
          $or: [
            { name: searchRegex },
            { code: identifierRegex ?? searchRegex },
            { shortName: searchRegex },
            { description: searchRegex },
          ],
        }
      : { status: { $ne: 'deleted' } };

    const contactsSources: TDataSource[] = [
      {
        count: () => models.Customers.countDocuments(customerQuery),
        fetch: async (skip, limit) => {
          const docs = await models.Customers.find(customerQuery)
            .sort({ createdAt: sortDirection, _id: sortDirection })
            .skip(skip)
            .limit(limit)
            .lean();

          return docs.map((doc) => {
            const name =
              [doc.firstName, doc.lastName].filter(Boolean).join(' ') ||
              doc.primaryEmail ||
              doc.primaryPhone ||
              'Unnamed';

            return {
              id: doc._id.toString(),
              title: name,
              description: doc.primaryEmail || doc.primaryPhone || undefined,
              icon: 'user',
              module: 'contacts-customer',
              category: 'core-modules',
              path: `/contacts/customers?contactId=${doc._id}`,
              createdAt: getCreatedAt(doc),
              matchFields: compactMatchFields([
                { label: 'First name', value: doc.firstName },
                { label: 'Last name', value: doc.lastName },
                { label: 'Email', value: doc.primaryEmail },
                { label: 'Phone', value: doc.primaryPhone },
              ]),
            };
          });
        },
      },
      {
        count: () => models.Companies.countDocuments(companyQuery),
        fetch: async (skip, limit) => {
          const docs = await models.Companies.find(companyQuery)
            .sort({ createdAt: sortDirection, _id: sortDirection })
            .skip(skip)
            .limit(limit)
            .lean();

          return docs.map((doc) => ({
            id: doc._id.toString(),
            title: doc.primaryName || 'Unnamed',
            description: doc.primaryEmail || doc.primaryPhone || undefined,
            icon: 'building-skyscraper',
            module: 'contacts-company',
            category: 'core-modules',
            path: `/contacts/companies?companyId=${doc._id}`,
            createdAt: getCreatedAt(doc),
            matchFields: compactMatchFields([
              { label: 'Company name', value: doc.primaryName },
              { label: 'Email', value: doc.primaryEmail },
              { label: 'Phone', value: doc.primaryPhone },
            ]),
          }));
        },
      },
    ];
    const productSources: TDataSource[] = [
      {
        count: () => models.Products.countDocuments(productQuery),
        fetch: async (skip, limit) => {
          const docs = await models.Products.find(productQuery)
            .sort({ createdAt: sortDirection, _id: sortDirection })
            .skip(skip)
            .limit(limit)
            .lean();

          return docs.map((doc) => ({
            id: doc._id.toString(),
            title: doc.name || doc.code || 'Unnamed product',
            description: doc.code || doc.shortName || undefined,
            icon: 'package',
            module: 'products-product',
            category: 'core-modules',
            path: `/products?product_id=${doc._id}`,
            createdAt: getCreatedAt(doc),
            matchFields: compactMatchFields([
              { label: 'Product name', value: doc.name },
              { label: 'Code', value: doc.code },
              { label: 'Short name', value: doc.shortName },
              { label: 'Description', value: doc.description },
            ]),
          }));
        },
      },
    ];
    const sourceGroups: Record<string, TDataSource[]> = {
      contacts: contactsSources,
      products: productSources,
    };
    const selectedModule = params.module?.trim().toLowerCase();
    const sources =
      selectedModule && sourceGroups[selectedModule]
        ? sourceGroups[selectedModule]
        : [...contactsSources, ...productSources];

    return paginateDataSources(sources, params);
  },

  settingsGlobalSearch: async (
    _parent: undefined,
    params: TQueryParams,
    { models }: IContext,
  ) => {
    const rawSearch = params.searchValue?.trim() ?? '';
    const sortDirection = params.orderBy?.createdAt === 1 ? 1 : -1;
    const escapedSearch = escapeRegExp(rawSearch);
    const searchRegex = escapedSearch
      ? new RegExp(escapedSearch, 'i')
      : undefined;

    const userQuery = searchRegex
      ? {
          isActive: { $ne: false },
          role: { $ne: 'system' },
          $or: [
            { username: searchRegex },
            { email: searchRegex },
            { employeeId: searchRegex },
            { 'details.fullName': searchRegex },
            { 'details.position': searchRegex },
          ],
        }
      : { isActive: { $ne: false }, role: { $ne: 'system' } };

    const structureEntityQuery = searchRegex
      ? {
          status: STRUCTURE_ENTITY_STATUSES.ACTIVE,
          $or: [{ title: searchRegex }, { code: searchRegex }],
        }
      : { status: STRUCTURE_ENTITY_STATUSES.ACTIVE };

    const brandQuery = searchRegex
      ? {
          status: { $ne: 'deleted' },
          $or: [{ name: searchRegex }, { description: searchRegex }],
        }
      : { status: { $ne: 'deleted' } };

    const sources: TDataSource[] = [
      {
        count: () => models.Users.countDocuments(userQuery),
        fetch: async (skip, limit) => {
          const docs = await models.Users.find(userQuery)
            .sort({ createdAt: sortDirection, _id: sortDirection })
            .skip(skip)
            .limit(limit)
            .lean();

          return docs.map((doc) => ({
            id: doc._id.toString(),
            title:
              doc.details?.fullName || doc.username || doc.email || 'Unnamed',
            description: doc.email || doc.details?.position || undefined,
            icon: 'user-check',
            module: 'settings-team-member',
            category: 'settings',
            path: `/settings/team/members?user_id=${doc._id}`,
            createdAt: getCreatedAt(doc),
            matchFields: compactMatchFields([
              { label: 'Full name', value: doc.details?.fullName },
              { label: 'Username', value: doc.username },
              { label: 'Email', value: doc.email },
              { label: 'Employee ID', value: doc.employeeId },
              { label: 'Position', value: doc.details?.position },
            ]),
          }));
        },
      },
      {
        count: () =>
          models.StructureEntities.countDocuments(structureEntityQuery),
        fetch: async (skip, limit) => {
          const docs = await models.StructureEntities.find(structureEntityQuery)
            .sort({ createdAt: sortDirection, _id: sortDirection })
            .skip(skip)
            .limit(limit)
            .lean();

          return docs.map((doc) => ({
            id: doc._id.toString(),
            title: doc.title,
            description: doc.code || doc.description || undefined,
            icon: 'hierarchy',
            module: 'settings-structure',
            category: 'settings',
            path: `/settings/structures?entity_id=${doc._id}`,
            createdAt: getCreatedAt(doc),
            matchFields: compactMatchFields([
              { label: 'Title', value: doc.title },
              { label: 'Code', value: doc.code },
            ]),
          }));
        },
      },
      {
        count: () => models.Brands.countDocuments(brandQuery),
        fetch: async (skip, limit) => {
          const docs = await models.Brands.find(brandQuery)
            .sort({ createdAt: sortDirection, _id: sortDirection })
            .skip(skip)
            .limit(limit)
            .lean();

          return docs.map((doc) => ({
            id: doc._id.toString(),
            title: doc.name || 'Brand',
            description: doc.description || undefined,
            icon: 'tag',
            module: 'settings-brand',
            category: 'settings',
            path: `/settings/brands?brand_id=${doc._id}`,
            createdAt: getCreatedAt(doc),
          }));
        },
      },
    ];

    return paginateDataSources(sources, params);
  },
};
