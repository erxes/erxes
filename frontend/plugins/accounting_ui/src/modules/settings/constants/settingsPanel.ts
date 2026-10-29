import { ACCOUNTING_SETTINGS_CODES } from '@/settings/constants/settingsRoutes';

export const ACCOUNT_CONTENT_TYPE = 'accounting:account';
export const ACCOUNT_CATEGORY_CONTENT_TYPE = 'accounting:accountCategory';
export const VAT_ROW_CONTENT_TYPE = 'accounting:vatRow';
export const CTAX_ROW_CONTENT_TYPE = 'accounting:ctaxRow';
export const JOB_CONTENT_TYPE = 'accounting:job';

export const getSyncConfigContentType = (code: string) => `accounting:${code}`;

export const getSyncConfigCode = (contentType: string) =>
  Object.values(ACCOUNTING_SETTINGS_CODES).find(
    (code) => getSyncConfigContentType(code) === contentType,
  );

export const SETTINGS_PANEL_CONTENT_TYPES = [
  ACCOUNT_CONTENT_TYPE,
  ACCOUNT_CATEGORY_CONTENT_TYPE,
  VAT_ROW_CONTENT_TYPE,
  CTAX_ROW_CONTENT_TYPE,
  JOB_CONTENT_TYPE,
  ...Object.values(ACCOUNTING_SETTINGS_CODES).map(getSyncConfigContentType),
];

export const SETTINGS_PANEL_CELL_CLASS_NAME =
  'w-full rounded-sm px-2 font-normal shadow-none';

export const SETTINGS_PANEL_SELECT_TRIGGER_CLASS_NAME =
  'h-7 rounded-sm px-2 text-xs font-normal shadow-none hover:bg-accent';

export const SETTINGS_PANEL_SELECT_ITEM_CLASS_NAME = 'h-7 text-xs';
