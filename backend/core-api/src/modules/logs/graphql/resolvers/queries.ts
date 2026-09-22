import { ILogContentTypeConfig } from 'erxes-api-shared/core-modules';
import { ILogDocument } from 'erxes-api-shared/core-types';
import { cursorPaginate, getPlugin, getPlugins } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { sanitizeLogValue } from '../../sanitize';

const operatorMap = {
  ne: '$ne',
  eq: '$eq',
  exists: '$exists',
  lt: '$lt',
  lte: '$lte',
  gt: '$gt',
  gte: '$gte',
  contain: '$regex',
  startsWith: '$regex',
  endsWith: '$regex',
};

const generateOperator = (operator) => operatorMap[operator] || '$eq';

const getCollectionTypeFromContentType = (contentType?: string) => {
  if (!contentType) {
    return '';
  }

  const [, , collectionType = ''] = contentType.replace(':', '.').split('.');
  return collectionType;
};

type PayloadFilterInput = {
  operator?: string;
  value?: unknown;
};

type LogsQueryParams = {
  status?: string;
  source?: string;
  action?: string;
  contentType?: string;
  documentId?: string;
  userIds?: string[];
  createdAtFrom?: string | Date;
  createdAtTo?: string | Date;
  filters?: Record<string, PayloadFilterInput>;
};

type LogsQueryFilter = Record<string, unknown> & {
  $or?: Array<Record<string, unknown>>;
  createdAt?: {
    $gte?: Date;
    $lte?: Date;
  };
  userId?: {
    $in: string[];
  };
};

type LeanLogDetail = Record<string, unknown> & {
  _id: string;
  source: string;
  payload?: unknown;
  prevObject?: unknown;
};

const generateValue = (field: string, value: unknown, operator: string) => {
  if (field === 'createdAt') {
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      value instanceof Date
    ) {
      return new Date(value);
    }

    return new Date(String(value ?? ''));
  }

  const stringValue = typeof value === 'string' ? value : String(value ?? '');

  if (operator === 'startsWith') {
    return new RegExp(`^${stringValue}`, 'i');
  }
  if (operator === 'endsWith') {
    return new RegExp(`${stringValue}$`, 'i');
  }
  if (operator === 'contain') {
    return new RegExp(stringValue, 'i');
  }

  if (operator === 'exists') {
    if (typeof value === 'boolean') {
      return value;
    }

    return value === 'true';
  }

  return value;
};

const generatePayloadFilters = (params: LogsQueryParams) => {
  const filter: Record<string, unknown> = {};

  if (Object.keys(params?.filters || {})?.length) {
    for (const [field, filterConfig] of Object.entries(params?.filters || {})) {
      if (!filterConfig) {
        continue;
      }

      const { operator = 'eq', value } = filterConfig;

      filter[`payload.${field}`] = {
        [generateOperator(operator)]: generateValue(field, value, operator),
      };
    }
  }

  return filter;
};

const generateBuiltInFilters = (params: LogsQueryParams) => {
  const filter: LogsQueryFilter = {};

  if (params.status) {
    filter.status = params.status;
  }

  if (params.source) {
    filter.source = params.source;
  }

  if (params.action) {
    filter.action = params.action;
  }

  if (params.contentType) {
    const collectionType = getCollectionTypeFromContentType(params.contentType);

    if (collectionType) {
      filter.$or = [
        { 'payload.collectionType': collectionType },
        { 'payload.collectionName': collectionType },
        { contentType: params.contentType },
      ];
    } else {
      filter.contentType = params.contentType;
    }
  }

  if (params.documentId) {
    filter.docId = params.documentId;
  }

  if (params.userIds?.length) {
    filter.userId = { $in: params.userIds };
  }

  if (params.createdAtFrom || params.createdAtTo) {
    filter.createdAt = {};

    if (params.createdAtFrom) {
      filter.createdAt.$gte = new Date(params.createdAtFrom);
    }

    if (params.createdAtTo) {
      filter.createdAt.$lte = new Date(params.createdAtTo);
    }
  }

  return filter;
};

const generateFilters = (params) => ({
  ...generateBuiltInFilters(params),
  ...generatePayloadFilters(params),
});

const requireLogsReadAccess = async (
  checkPermission: IContext['checkPermission'],
) => {
  await checkPermission('logsRead');
};

const sortByContentType = (
  a: { pluginName: string; moduleName: string; collectionName: string },
  b: { pluginName: string; moduleName: string; collectionName: string },
) =>
  `${a.pluginName}:${a.moduleName}.${a.collectionName}`.localeCompare(
    `${b.pluginName}:${b.moduleName}.${b.collectionName}`,
  );

export const logQueries = {
  async logsGetContentTypes(
    _root: unknown,
    _args: unknown,
    { checkPermission }: IContext,
  ) {
    await requireLogsReadAccess(checkPermission);

    const pluginNames = await getPlugins();
    const pluginContentTypes = await Promise.all(
      pluginNames.map(async (pluginName) => {
        try {
          const plugin = await getPlugin(pluginName);
          const meta = plugin.config?.meta || {};
          const serviceContentTypes = (meta.logs?.contentTypes ||
            []) as ILogContentTypeConfig[];

          return serviceContentTypes
            .filter(({ moduleName, collectionName }) => {
              return !!moduleName && !!collectionName;
            })
            .map(({ moduleName, collectionName }) => ({
              value: `${pluginName}:${moduleName}.${collectionName}`,
              pluginName,
              moduleName,
              collectionName,
            }));
        } catch (error) {
          console.error(
            `Failed to load logs config from plugin ${pluginName}:`,
            error,
          );
          return [];
        }
      }),
    );

    const seen = new Set<string>();
    const contentTypes = pluginContentTypes.flat().filter(({ value }) => {
      if (seen.has(value)) {
        return false;
      }

      seen.add(value);
      return true;
    });

    return contentTypes.sort(sortByContentType);
  },

  async logsMainList(
    _root: unknown,
    args: LogsQueryParams,
    { models, checkPermission }: IContext,
  ) {
    await requireLogsReadAccess(checkPermission);

    const filter = generateFilters(args);

    const { list, totalCount, pageInfo } = await cursorPaginate<ILogDocument>({
      model: models.Logs,
      params: {
        ...args,
        orderBy: { createdAt: -1 },
      },
      query: filter,
    });

    return {
      list,
      totalCount,
      pageInfo,
    };
  },

  async logDetail(
    _root: unknown,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await requireLogsReadAccess(checkPermission);

    const detail = (await models.Logs.findOne({
      _id,
    }).lean()) as LeanLogDetail | null;

    if (!detail) {
      return null;
    }

    const payloadSanitizeOptions = {
      exposeEmail: detail.source === 'auth',
    };

    return {
      ...detail,
      payload: sanitizeLogValue(
        detail.payload,
        undefined,
        payloadSanitizeOptions,
      ),
      prevObject: sanitizeLogValue(detail.prevObject),
    };
  },
};
