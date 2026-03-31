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

const sanitizeLogValue = (
  value: any,
  key?: string,
  options: SanitizeLogOptions = {},
): any => {
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
    return Object.entries(value).reduce<Record<string, any>>(
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

const generateValue = (field, value, operator) => {
  if (field === 'createdAt') {
    return new Date(value);
  }
  if (operator === 'startsWith') {
    return new RegExp(`^${value}`, 'i');
  }
  if (operator === 'endsWith') {
    return new RegExp(`${value}$`, 'i');
  }
  if (operator === 'contain') {
    return new RegExp(value, 'i');
  }

  if (operator === 'exists') {
    return JSON.parse(value);
  }

  return value;
};

const generatePayloadFilters = (params) => {
  const filter: any = {};

  if (Object.keys(params?.filters || {})?.length) {
    for (const [field, { operator, value }] of Object.entries<{
      operator: string;
      value: any;
    }>(params?.filters)) {
      filter[`payload.${field}`] = {
        [generateOperator(operator)]: generateValue(field, value, operator),
      };
    }
  }

  return filter;
};

const generateBuiltInFilters = (params) => {
  const filter: any = {};

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

const sortByContentType = (
  a: { pluginName: string; moduleName: string; collectionName: string },
  b: { pluginName: string; moduleName: string; collectionName: string },
) =>
  `${a.pluginName}:${a.moduleName}.${a.collectionName}`.localeCompare(
    `${b.pluginName}:${b.moduleName}.${b.collectionName}`,
  );

export const logQueries = {
  async logsGetContentTypes() {
    const pluginNames = await getPlugins();
    const seen = new Set<string>();
    const contentTypes: Array<{
      value: string;
      pluginName: string;
      moduleName: string;
      collectionName: string;
    }> = [];

    for (const pluginName of pluginNames) {
      const plugin = await getPlugin(pluginName);
      const meta = plugin.config?.meta || {};
      const serviceContentTypes = (meta.logs?.contentTypes ||
        []) as ILogContentTypeConfig[];

      for (const { moduleName, collectionName } of serviceContentTypes) {
        if (!moduleName || !collectionName) {
          continue;
        }

        const value = `${pluginName}:${moduleName}.${collectionName}`;

        if (seen.has(value)) {
          continue;
        }

        seen.add(value);
        contentTypes.push({
          value,
          pluginName,
          moduleName,
          collectionName,
        });
      }
    }

    return contentTypes.sort(sortByContentType);
  },

  async logsMainList(_root, args, { models }: IContext) {
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

  async logDetail(_root, { _id }, { models }: IContext) {
    const detail = await models.Logs.findOne({ _id }).lean();

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
      prevObject: sanitizeLogValue((detail as any).prevObject),
    };
  },
};
