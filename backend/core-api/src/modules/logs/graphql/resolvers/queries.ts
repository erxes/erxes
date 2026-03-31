import { ILogContentTypeConfig } from 'erxes-api-shared/core-modules';
import { ILogDocument } from 'erxes-api-shared/core-types';
import { cursorPaginate, getPlugin, getPlugins } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

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

const SECRET_KEY_PATTERNS = [
  /password/i,
  /passcode/i,
  /token/i,
  /secret/i,
  /authorization/i,
  /cookie/i,
  /api[-_]?key/i,
  /private[-_]?key/i,
];

const EMAIL_KEY_PATTERNS = [/email/i];
const IP_KEY_PATTERNS = [/(^|[_-])ip$/i, /ipAddress/i];
const PHONE_KEY_PATTERNS = [/phone/i, /mobile/i];

const isSecretKey = (key: string) =>
  SECRET_KEY_PATTERNS.some((pattern) => pattern.test(key));

const isIdLikeKey = (key: string) =>
  key === '__v' ||
  /^_id$/i.test(key) ||
  /^id$/i.test(key) ||
  /Id(s)?$/.test(key) ||
  /[_-]id(s)?$/i.test(key) ||
  /^(createdBy|updatedBy)$/i.test(key);

const isEmailKey = (key: string) =>
  EMAIL_KEY_PATTERNS.some((pattern) => pattern.test(key));

const isIpKey = (key: string) =>
  IP_KEY_PATTERNS.some((pattern) => pattern.test(key));

const isPhoneKey = (key: string) =>
  PHONE_KEY_PATTERNS.some((pattern) => pattern.test(key));

const maskIdentifier = (value: string) => {
  if (!value) {
    return '••••••';
  }

  if (value.length <= 8) {
    return '••••••';
  }

  return `${value.slice(0, 4)}••••••••${value.slice(-4)}`;
};

const maskEmail = (value: string) => {
  const [local = '', domain = ''] = value.split('@');

  if (!local || !domain) {
    return '••••••';
  }

  const visibleLocal = local.slice(0, Math.min(2, local.length));
  return `${visibleLocal}••••@${domain}`;
};

const maskIpAddress = (value: string) => {
  if (value.includes('.')) {
    const [first = '*', second = '*'] = value.split('.');
    return `${first}.${second}.***.***`;
  }

  if (value.includes(':')) {
    const [head = '****'] = value.split(':');
    return `${head}:****:****`;
  }

  return '••••••';
};

const maskPhone = (value: string) => {
  if (value.length <= 4) {
    return '••••';
  }

  return `${'•'.repeat(Math.max(4, value.length - 2))}${value.slice(-2)}`;
};

type SanitizeLogOptions = {
  exposeEmail?: boolean;
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

const sanitizeLogValue = (
  value: unknown,
  key?: string,
  options: SanitizeLogOptions = {},
): unknown => {
  if (value === null || value === undefined) {
    return value;
  }

  if (Array.isArray(value)) {
    if (key && isIdLikeKey(key)) {
      return value.map((item) =>
        typeof item === 'string'
          ? maskIdentifier(item)
          : sanitizeLogValue(item, undefined, options),
      );
    }

    return value.map((item) => sanitizeLogValue(item, key, options));
  }

  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).reduce<
      Record<string, unknown>
    >(
      (acc, [childKey, childValue]) => {
        acc[childKey] = sanitizeLogValue(childValue, childKey, options);
        return acc;
      },
      {},
    );
  }

  if (!key || typeof value !== 'string') {
    return value;
  }

  if (isSecretKey(key)) {
    return '••••••';
  }

  if (key === '__v') {
    return '[hidden]';
  }

  if (isIdLikeKey(key)) {
    return maskIdentifier(value);
  }

  if (isEmailKey(key)) {
    if (options.exposeEmail) {
      return value;
    }

    return maskEmail(value);
  }

  if (isIpKey(key)) {
    return maskIpAddress(value);
  }

  if (isPhoneKey(key)) {
    return maskPhone(value);
  }

  return value;
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

    const detail = (await models.Logs.findOne({ _id }).lean()) as
      | LeanLogDetail
      | null;

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
