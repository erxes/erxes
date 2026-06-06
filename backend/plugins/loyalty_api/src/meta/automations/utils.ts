import { replaceOutputPlaceholders } from 'erxes-api-shared/core-modules';
import {
  LoyaltyAutomationExecution,
  LoyaltyAutomationTarget,
  LoyaltyOwnerType,
} from './types';

type LoyaltyOwnerConfig = {
  ownerType?: LoyaltyOwnerType;
  ownerId?: string;
  ownerIds?: string[];
  attribution?: string;
};

const OWNER_TYPE_BY_ATTRIBUTE: Array<{
  patterns: string[];
  ownerType: LoyaltyOwnerType;
}> = [
  { patterns: ['customers', 'customer'], ownerType: 'customer' },
  { patterns: ['companies', 'company'], ownerType: 'company' },
  {
    patterns: ['users', 'user', 'teamMembers', 'teamMember'],
    ownerType: 'user',
  },
];

const splitListValue = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const unique = (values: string[]) => [...new Set(values)];

export const getBirthDate = (target: LoyaltyAutomationTarget) => {
  return target.details?.birthDate || target.birthDate;
};

export const isBirthdayThisMonth = (birthDate?: string | Date) => {
  if (!birthDate) {
    return false;
  }

  return new Date(birthDate).getMonth() === new Date().getMonth();
};

export const getVoucherConfigByRule = (customRule?: { duration?: string }) => {
  if (!customRule?.duration) {
    return undefined;
  }

  const endDate = new Date();

  if (customRule.duration === 'month') {
    endDate.setMonth(endDate.getMonth() + 1);
  }

  if (customRule.duration === 'week') {
    endDate.setDate(endDate.getDate() + 7);
  }

  if (customRule.duration === 'day') {
    endDate.setDate(endDate.getDate() + 1);
  }

  if (customRule.duration === 'minute') {
    endDate.setMinutes(endDate.getMinutes() + 2);
  }

  return { endDate };
};

export const extractPlaceholderAttributes = (value = '') => {
  const matches = value.match(/\{\{\s*([^}]+)\s*\}\}/g) || [];

  return matches.map((match) => match.replace(/\{\{\s*|\s*\}\}/g, '').trim());
};

export const getOwnerTypeFromAttribution = (
  attribution = '',
): LoyaltyOwnerType => {
  const [attribute = ''] = extractPlaceholderAttributes(attribution);
  const normalized = attribute
    .split(/[.\[\]\s]+/)
    .filter(Boolean)
    .pop();

  return (
    OWNER_TYPE_BY_ATTRIBUTE.find(({ patterns }) =>
      patterns.includes(normalized || ''),
    )?.ownerType || 'customer'
  );
};

const getOwnerTypeFromTarget = (
  target?: LoyaltyAutomationTarget,
): LoyaltyOwnerType => {
  if (!target) {
    return 'customer';
  }

  if ('details' in target) {
    return 'user';
  }

  if ('customerId' in target) {
    return 'customer';
  }

  return 'customer';
};

export const generateIds = (value: unknown) => {
  if (Array.isArray(value)) {
    return unique(
      value.flatMap((item) => {
        if (typeof item === 'string') {
          return splitListValue(item);
        }

        if (item && typeof item === 'object') {
          const record = item as Record<string, unknown>;
          const id = record._id || record.id;

          return typeof id === 'string' ? [id] : [];
        }

        return [];
      }),
    );
  }

  if (typeof value === 'string') {
    return unique(splitListValue(value));
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const id = record._id || record.id;

    return typeof id === 'string' ? [id] : [];
  }

  return [];
};

export const replaceAutomationPlaceholders = async ({
  subdomain,
  execution,
  values,
}: {
  subdomain: string;
  execution: LoyaltyAutomationExecution;
  values: Record<string, unknown>;
}) => {
  return replaceOutputPlaceholders({
    subdomain,
    execution,
    values,
    defaultValue: '',
    keepUnresolvedPlaceholders: false,
  });
};

export const resolveAutomationOwners = async ({
  subdomain,
  execution,
  config,
  errorMessage,
}: {
  subdomain: string;
  execution: LoyaltyAutomationExecution;
  config: LoyaltyOwnerConfig;
  errorMessage: string;
}) => {
  let ownerIds = generateIds(config.ownerIds || config.ownerId);

  if (!ownerIds.length && config.attribution) {
    const replaced = await replaceAutomationPlaceholders({
      subdomain,
      execution,
      values: { ownerIds: config.attribution },
    });

    ownerIds = generateIds(replaced.ownerIds);
  }

  if (!ownerIds.length && execution.targetId) {
    ownerIds = [execution.targetId];
  }

  if (!ownerIds.length) {
    throw new Error(errorMessage);
  }

  return {
    ownerIds,
    ownerType:
      config.ownerType ||
      (config.attribution
        ? getOwnerTypeFromAttribution(config.attribution)
        : getOwnerTypeFromTarget(execution.target as LoyaltyAutomationTarget)),
  };
};
