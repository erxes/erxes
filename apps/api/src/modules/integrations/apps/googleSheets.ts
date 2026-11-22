import { defineIntegration, oauthKeys } from '@erxes/plugin-sdk/integrations';
import { accountOf, SHEETS_RECORDS } from './googleSheetsApi';
import { addOrUpdateRow, addRow, deleteRows, findRows, updateRows } from './googleSheetsActions';
import {
  addSheet,
  clearSheet,
  createSpreadsheetAction,
  deleteSheet,
} from './googleSheetsSheetActions';
import { rowAdded, rowChanged } from './googleSheetsTriggers';

export const googleSheets = defineIntegration({
  key: 'googlesheets',
  name: 'Google Sheets',
  summary:
    'Start automations when rows are added to or changed in a Google Sheets spreadsheet, and add, find, update and delete rows and sheets from them.',
  category: 'productivity',
  countries: [],
  permission: 'integrations.manage',
  dashboard: 'https://console.cloud.google.com/apis/credentials',
  keys: oauthKeys,
  oauth: {
    authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: [
      'openid',
      'email',
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.metadata.readonly',
    ],
    authorizeParams: { access_type: 'offline', prompt: 'consent' },
    account: (accessToken) => accountOf(accessToken),
  },
  client: (keys) => keys,
  async verify(keys) {
    await accountOf(keys.accessToken);
  },
  triggers: [rowAdded, rowChanged],
  records: SHEETS_RECORDS,
  actions: [
    addRow,
    addOrUpdateRow,
    updateRows,
    findRows,
    deleteRows,
    clearSheet,
    addSheet,
    deleteSheet,
    createSpreadsheetAction,
  ],
});
