import { IJournalReportBase } from '../maps';

export const accountStatementReportBase: IJournalReportBase = {
  code: 'ac',
  baseGroups: ['accountId'],
  supportsMore: true,
};

export const trialBalanceReportBase: IJournalReportBase = {
  code: 'tb',
  baseGroups: ['accountId'],
};

export const mainJournalReportBase: IJournalReportBase = {
  code: 'mj',
  baseGroups: ['ptrId', 'accountId'],
  recordMode: 'line',
};

export const mainJournalSummaryReportBase: IJournalReportBase = {
  code: 'mjs',
  baseGroups: ['ptrId'],
  recordMode: 'line',
};

export const generalLedgerReportBase: IJournalReportBase = {
  code: 'mb',
  baseGroups: ['accountId'],
};
