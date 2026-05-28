import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { ITicketPipelineDocument } from '@/ticket/@types/pipeline';

// ─── Number config ────────────────────────────────────────────────────────────

function configReplacer(config: string): string {
  const now = new Date();
  return config
    .replace(/\{year\}/g, now.getFullYear().toString())
    .replace(/\{month\}/g, `0${now.getMonth() + 1}`.slice(-2))
    .replace(/\{day\}/g, `0${now.getDate()}`.slice(-2));
}

function numberCalculator(size: number, num: string, skip?: boolean): string {
  const n = skip ? 0 : (parseInt(num, 10) || 0) + 1;
  let s = n.toString();
  while (s.length < size) s = '0' + s;
  return s;
}

export async function generateTicketNumber(
  models: IModels,
  pipeline: ITicketPipelineDocument,
): Promise<string | undefined> {
  if (!pipeline.numberSize) return undefined;

  const { numberSize, numberConfig = '' } = pipeline;
  const replacedConfig = configReplacer(numberConfig);
  const re = new RegExp(replacedConfig.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[0-9]+$');

  const existing = await models.Pipeline.findOne({
    lastNum: re,
    numberConfig: pipeline.numberConfig,
  }).lean();

  let number: string;

  if (existing?.lastNum) {
    const lastGeneratedPart = existing.lastNum.slice(replacedConfig.length);
    number = replacedConfig + numberCalculator(parseInt(numberSize, 10), lastGeneratedPart);
  } else {
    number = replacedConfig + numberCalculator(parseInt(numberSize, 10), '', true);
  }

  return number;
}

export async function updatePipelineLastNum(
  models: IModels,
  numberConfig: string,
  lastNum: string,
): Promise<void> {
  await models.Pipeline.updateMany(
    { numberConfig },
    { $set: { lastNum } },
  );
}


async function fetchCustomers(
  subdomain: string,
  ids: string[],
): Promise<any[]> {
  if (!ids.length) return [];
  return sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'customers',
    action: 'find',
    input: { query: { _id: { $in: ids } } },
    defaultValue: [],
  });
}

async function fetchCompanies(
  subdomain: string,
  ids: string[],
): Promise<any[]> {
  if (!ids.length) return [];
  return sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'companies',
    action: 'find',
    input: { query: { _id: { $in: ids } } },
    defaultValue: [],
  });
}

export async function applyNameConfig(
  subdomain: string,
  nameConfig: string,
  customerIds: string[],
  companyIds: string[],
  user?: any,
): Promise<string> {
  const tokenRegex = /\{([^}]+)\}/g;
  const tokens = nameConfig.match(tokenRegex) || [];

  const serviceNames = [
    ...new Set(
      tokens.map((t) => t.replace('{', '').replace('}', '').split('.')[0]),
    ),
  ];

  const needsCustomers = serviceNames.some(
    (s) => s === 'customer' || s === 'customFieldsData',
  );
  const needsCompanies = serviceNames.includes('company');

  const [customers, companies] = await Promise.all([
    needsCustomers ? fetchCustomers(subdomain, customerIds) : [],
    needsCompanies ? fetchCompanies(subdomain, companyIds) : [],
  ]);

  let result = nameConfig;

  for (const serviceName of serviceNames) {
    const re = new RegExp(`\\{\\b${serviceName}\\b.*?\\}`, 'g');
    const serviceTokens = nameConfig.match(re) || [];

    for (const token of serviceTokens) {
      const parts = token.replace('{', '').replace('}', '').split('.');

      if (serviceName === 'date') {
        const local = new Date(Date.now() + 8 * 60 * 60 * 1000);
        result = result.replace(token, local.toISOString().slice(0, 10));
        continue;
      }

      if (serviceName === 'time') {
        const local = new Date(Date.now() + 8 * 60 * 60 * 1000);
        const hh = String(local.getUTCHours()).padStart(2, '0');
        const mm = String(local.getUTCMinutes()).padStart(2, '0');
        result = result.replace(token, `${hh}:${mm}`);
        continue;
      }

      if (serviceName === 'customer') {
        const c = customers[0];
        switch (parts[1]) {
          case 'firstName':  result = result.replace(token, c?.firstName || ''); break;
          case 'lastName':   result = result.replace(token, c?.lastName || ''); break;
          case 'email':      result = result.replace(token, c?.primaryEmail || ''); break;
          case 'phone':      result = result.replace(token, c?.primaryPhone || ''); break;
          case 'count':      result = result.replace(token, String(customers.length)); break;
          default:           result = result.replace(token, ''); break;
        }
        continue;
      }

      if (serviceName === 'company') {
        const co = companies[0];
        if (parts[1] === 'name')  result = result.replace(token, co?.primaryName || '');
        else if (parts[1] === 'count') result = result.replace(token, String(companies.length));
        else result = result.replace(token, '');
        continue;
      }

      if (serviceName === 'user' && user) {
        const details = user.details || {};
        switch (parts[1]) {
          case 'firstName': result = result.replace(token, details.firstName || ''); break;
          case 'lastName':  result = result.replace(token, details.lastName || ''); break;
          case 'fullName':  result = result.replace(token, details.fullName || ''); break;
          case 'email':     result = result.replace(token, user.email || ''); break;
          default:          result = result.replace(token, ''); break;
        }
        continue;
      }

      if (serviceName === 'customFieldsData') {
        const fieldId = parts[1];
        const cf = customers[0]?.customFieldsData?.find(
          (f: any) => f.field === fieldId,
        );
        result = result.replace(token, cf?.value || '');
        continue;
      }

      result = result.replace(token, '');
    }
  }

  return result;
}
