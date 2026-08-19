import { escapeRegExp } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

type TGlobalSearchItem = {
  id: string;
  title: string;
  description?: string;
  subTitle?: string;
  icon?: string;
  module: string;
  category: string;
  path: string;
};

type TQueryParams = {
  searchValue?: string;
  limit?: number;
  cursor?: string;
  direction?: 'forward' | 'backward';
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
      ? data.offsets.map((value: unknown) =>
          Math.max(0, Number(value) || 0),
        )
      : [];
  } catch {
    return [];
  }
};

const encodeOffsets = (offsets: number[]): string =>
  Buffer.from(JSON.stringify({ offsets })).toString('base64');

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

  const perSource = Math.ceil((limit + 1) / sourceCount);
  const batches = await Promise.all(
    sources.map((source, index) => source.fetch(offsets[index], perSource)),
  );

  const counts = await Promise.all(sources.map((source) => source.count()));
  const totalCount = counts.reduce((sum, count) => sum + count, 0);

  const merged: TGlobalSearchItem[] = [];
  const position = new Array(sourceCount).fill(0);

  while (merged.length <= limit) {
    let added = false;

    for (let i = 0; i < sourceCount; i++) {
      if (position[i] < batches[i].length) {
        merged.push(batches[i][position[i]]);
        position[i] += 1;
        added = true;

        if (merged.length > limit) {
          break;
        }
      }
    }

    if (!added) {
      break;
    }
  }

  const nextOffsets = offsets.map((offset, index) => offset + batches[index].length);
  const hasNextPage =
    merged.length > limit ||
    batches.some((batch) => batch.length >= perSource);
  const list = hasNextPage ? merged.slice(0, limit) : merged;

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
    const rawSearch = params.searchValue?.trim() ?? '';
    const escapedSearch = escapeRegExp(rawSearch);
    const searchRegex = escapedSearch
      ? new RegExp(escapedSearch, 'i')
      : undefined;

    const customerQuery = searchRegex
      ? {
          status: { $ne: 'deleted' },
          $or: [
            { firstName: searchRegex },
            { lastName: searchRegex },
            { primaryEmail: searchRegex },
            { primaryPhone: searchRegex },
          ],
        }
      : { status: { $ne: 'deleted' } };

    const companyQuery = searchRegex
      ? {
          status: { $ne: 'deleted' },
          $or: [
            { primaryName: searchRegex },
            { primaryEmail: searchRegex },
            { primaryPhone: searchRegex },
          ],
        }
      : { status: { $ne: 'deleted' } };

    const productQuery = searchRegex
      ? {
          status: { $ne: 'deleted' },
          $or: [
            { name: searchRegex },
            { code: searchRegex },
            { shortName: searchRegex },
            { description: searchRegex },
          ],
        }
      : { status: { $ne: 'deleted' } };

    const sources: TDataSource[] = [
      {
        count: () => models.Customers.countDocuments(customerQuery),
        fetch: async (skip, limit) => {
          const docs = await models.Customers.find(customerQuery)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

          return docs.map((doc: any) => {
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
            };
          });
        },
      },
      {
        count: () => models.Companies.countDocuments(companyQuery),
        fetch: async (skip, limit) => {
          const docs = await models.Companies.find(companyQuery)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

          return docs.map((doc: any) => ({
            id: doc._id.toString(),
            title: doc.primaryName || 'Unnamed',
            description: doc.primaryEmail || doc.primaryPhone || undefined,
            icon: 'building-skyscraper',
            module: 'contacts-company',
            category: 'core-modules',
            path: `/contacts/companies?companyId=${doc._id}`,
          }));
        },
      },
      {
        count: () => models.Products.countDocuments(productQuery),
        fetch: async (skip, limit) => {
          const docs = await models.Products.find(productQuery)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

          return docs.map((doc: any) => ({
            id: doc._id.toString(),
            title: doc.name || doc.code || 'Unnamed product',
            description: doc.code || doc.shortName || undefined,
            icon: 'package',
            module: 'products-product',
            category: 'core-modules',
            path: `/products?productId=${doc._id}`,
          }));
        },
      },
    ];

    return paginateDataSources(sources, params);
  },

  settingsGlobalSearch: async (
    _parent: undefined,
    params: TQueryParams,
    { models }: IContext,
  ) => {
    const rawSearch = params.searchValue?.trim() ?? '';
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

    const branchQuery = searchRegex
      ? {
          status: { $ne: 'deleted' },
          $or: [
            { title: searchRegex },
            { code: searchRegex },
            { address: searchRegex },
          ],
        }
      : { status: { $ne: 'deleted' } };

    const departmentQuery = searchRegex
      ? {
          status: { $ne: 'deleted' },
          $or: [
            { title: searchRegex },
            { code: searchRegex },
            { description: searchRegex },
          ],
        }
      : { status: { $ne: 'deleted' } };

    const unitQuery = searchRegex
      ? {
          status: { $ne: 'deleted' },
          $or: [
            { title: searchRegex },
            { code: searchRegex },
            { description: searchRegex },
          ],
        }
      : { status: { $ne: 'deleted' } };

    const positionQuery = searchRegex
      ? {
          status: { $ne: 'deleted' },
          $or: [{ title: searchRegex }, { code: searchRegex }],
        }
      : { status: { $ne: 'deleted' } };

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
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

          return docs.map((doc: any) => ({
            id: doc._id.toString(),
            title:
              doc.details?.fullName || doc.username || doc.email || 'Unnamed',
            description: doc.email || doc.details?.position || undefined,
            icon: 'user-check',
            module: 'settings-team-member',
            category: 'settings',
            path: `/settings/team-members?userId=${doc._id}`,
          }));
        },
      },
      {
        count: () => models.Branches.countDocuments(branchQuery),
        fetch: async (skip, limit) => {
          const docs = await models.Branches.find(branchQuery)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

          return docs.map((doc: any) => ({
            id: doc._id.toString(),
            title: doc.title || doc.code || 'Branch',
            description: doc.code || doc.address || undefined,
            icon: 'git-branch',
            module: 'settings-branch',
            category: 'settings',
            path: '/settings/branches',
          }));
        },
      },
      {
        count: () => models.Departments.countDocuments(departmentQuery),
        fetch: async (skip, limit) => {
          const docs = await models.Departments.find(departmentQuery)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

          return docs.map((doc: any) => ({
            id: doc._id.toString(),
            title: doc.title || doc.code || 'Department',
            description: doc.code || doc.description || undefined,
            icon: 'building',
            module: 'settings-department',
            category: 'settings',
            path: '/settings/departments',
          }));
        },
      },
      {
        count: () => models.Units.countDocuments(unitQuery),
        fetch: async (skip, limit) => {
          const docs = await models.Units.find(unitQuery)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

          return docs.map((doc: any) => ({
            id: doc._id.toString(),
            title: doc.title || doc.code || 'Unit',
            description: doc.code || doc.description || undefined,
            icon: 'hierarchy',
            module: 'settings-unit',
            category: 'settings',
            path: '/settings/units',
          }));
        },
      },
      {
        count: () => models.Positions.countDocuments(positionQuery),
        fetch: async (skip, limit) => {
          const docs = await models.Positions.find(positionQuery)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

          return docs.map((doc: any) => ({
            id: doc._id.toString(),
            title: doc.title || doc.code || 'Position',
            description: doc.code || undefined,
            icon: 'briefcase',
            module: 'settings-position',
            category: 'settings',
            path: '/settings/positions',
          }));
        },
      },
      {
        count: () => models.Brands.countDocuments(brandQuery),
        fetch: async (skip, limit) => {
          const docs = await models.Brands.find(brandQuery)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

          return docs.map((doc: any) => ({
            id: doc._id.toString(),
            title: doc.name || 'Brand',
            description: doc.description || undefined,
            icon: 'tag',
            module: 'settings-brand',
            category: 'settings',
            path: '/settings/brands',
          }));
        },
      },
    ];

    return paginateDataSources(sources, params);
  },

  pluginsGlobalSearch: async (
    _parent: undefined,
    params: TQueryParams,
    _context: IContext,
  ) => {
    // Aggregator placeholder for plugin search
    return {
      list: [],
      totalCount: 0,
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
    };
  },
};
