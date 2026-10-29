import type { TFunction } from 'i18next';
import { JOURNAL_LABELS } from '@/settings/account/constants/journalLabel';
import {
  ACCOUNT_KIND_LABELS,
  ACCOUNT_STATUS_LABELS,
  AccountKind,
  AccountStatus,
  JournalEnum,
} from '@/settings/account/types/Account';

export const getAccountKindOptions = (t: TFunction<'accounting'>) =>
  Object.values(AccountKind).map((kind) => ({
    value: kind,
    label: t(ACCOUNT_KIND_LABELS[kind] || ''),
  }));

export const getAccountJournalOptions = (t: TFunction<'accounting'>) =>
  Object.values(JournalEnum).map((journal) => ({
    value: journal,
    label: t(JOURNAL_LABELS[journal] || ''),
  }));

export const getAccountStatusOptions = (t: TFunction<'accounting'>) =>
  Object.values(AccountStatus).map((status) => ({
    value: status,
    label: t(ACCOUNT_STATUS_LABELS[status] || ''),
  }));
