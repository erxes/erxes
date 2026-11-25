import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { ITransaction } from '../../types/Transaction';
import type { ITransactionGroupForm } from '../types/JournalForms';

export const activeJournalState = atom<string>('0');
export const followTrDocsState = atom<ITransaction[]>([]);
export const transactionPanelFormState = atom<{
  contentId: string;
  form: ITransactionGroupForm;
  canEdit: boolean;
} | null>(null);
export const taxPercentsState = atom<{
  vat?: number;
  ctax?: number;
  sum: number;
}>({ sum: 0 });
export const isPerfectState = atom<boolean>(false);
export const showAdvancedViewState = atomWithStorage<boolean>(
  'accountingFormShowAdvancedView',
  false,
);
