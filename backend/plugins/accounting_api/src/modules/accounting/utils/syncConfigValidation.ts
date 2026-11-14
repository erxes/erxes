type TSyncConfigValue = Record<string, unknown> | null | undefined;

const SALE_ACCOUNT_FIELDS = [
  'saleAccountId',
  'saleOutAccountId',
  'saleCostAccountId',
];

const SYNC_CONFIG_RULES: Record<
  string,
  { subIdLabel: string; requiredFields: string[]; checksTaxRows: boolean }
> = {
  syncDeal: {
    subIdLabel: 'stageId',
    requiredFields: SALE_ACCOUNT_FIELDS,
    checksTaxRows: true,
  },
  syncDealReturn: {
    subIdLabel: 'stageId',
    requiredFields: [],
    checksTaxRows: false,
  },
  syncDealMovement: {
    subIdLabel: 'stageId',
    requiredFields: ['sourceAccountId', 'destinationAccountId'],
    checksTaxRows: false,
  },
  syncOrder: {
    subIdLabel: 'posId',
    requiredFields: SALE_ACCOUNT_FIELDS,
    checksTaxRows: true,
  },
};

const isBlank = (value: unknown) => typeof value !== 'string' || !value.trim();

export const validateSyncConfig = ({
  code,
  subId,
  value,
}: {
  code: string;
  subId?: string;
  value: TSyncConfigValue;
}) => {
  const rule = SYNC_CONFIG_RULES[code];

  if (!rule) {
    return;
  }

  const config = value ?? {};
  const missing: string[] = [];

  if (isBlank(config.title)) {
    missing.push('title');
  }

  if (isBlank(subId)) {
    missing.push(rule.subIdLabel);
  }

  for (const field of rule.requiredFields) {
    if (isBlank(config[field])) {
      missing.push(field);
    }
  }

  if (rule.checksTaxRows) {
    if (config.hasVat && isBlank(config.vatRowId)) {
      missing.push('vatRowId');
    }

    if (config.hasCtax && isBlank(config.ctaxRowId)) {
      missing.push('ctaxRowId');
    }
  }

  if (missing.length) {
    throw new Error(
      `Sync rule is missing required fields: ${missing.join(', ')}`,
    );
  }
};
