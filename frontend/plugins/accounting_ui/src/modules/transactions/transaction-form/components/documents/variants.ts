import { ITransaction } from '~/modules/transactions/types/Transaction';
import { TrJournalEnum } from '~/modules/transactions/types/constants';
import { CashVariant } from './cash';
import { InvIncomeVariant } from './invIncome';
import { InvMoveVariant } from './invMove';
import { InvSaleVariant } from './invSale';

// A journal whose print document has more than one selectable layout.
export interface IDocumentVariant {
  value: string;
  label: string;
}

// Per-journal layout options shown as a toggle in the print toolbar.
// Journals absent from this map print a single fixed layout.
export const DOCUMENT_VARIANTS: Partial<
  Record<TrJournalEnum, IDocumentVariant[]>
> = {
  [TrJournalEnum.RECEIVABLE]: [
    { value: 'payer', label: 'payer' },
    { value: 'responsible', label: 'assigned-to' },
  ],
  [TrJournalEnum.CASH]: [
    { value: 'twin-table', label: 'receipt-issue-table' },
    { value: 'lined', label: 'cash-receipt-voucher' },
    { value: 'dotted', label: 'cash-voucher' },
    { value: 'twin-dotted', label: 'cash-voucher-two-copies' },
  ],
  [TrJournalEnum.INV_MOVE]: [
    { value: 'standard', label: 'internal-transfer' },
    { value: 'byPrice', label: 'internal-transfer-at-value' },
  ],
  [TrJournalEnum.INV_SALE]: [
    { value: 'numbered', label: 'issue-voucher-no' },
    { value: 'twin', label: 'issue-voucher-two-copies' },
    { value: 'location', label: 'issue-voucher-with-location' },
    { value: 'discount', label: 'issue-voucher-with-discount' },
  ],
  [TrJournalEnum.INV_INCOME]: [
    { value: 'numbered', label: 'receipt-voucher-no' },
    { value: 'twin', label: 'receipt-voucher-two-copies' },
    { value: 'simple', label: 'standard-receipt-voucher' },
    { value: 'discount', label: 'receipt-voucher-with-discount' },
  ],
};

// First (default) variant for a journal, or '' when it has no variants.
export const getDefaultVariant = (journal: TrJournalEnum): string =>
  DOCUMENT_VARIANTS[journal]?.[0]?.value ?? '';

// Variant options for a transaction's journal — empty when none apply.
export const getDocumentVariants = (
  transaction: ITransaction,
): IDocumentVariant[] => DOCUMENT_VARIANTS[transaction.journal] ?? [];

// Narrowed accessors so document components keep their precise prop types.
export const asCashVariant = (variant: string): CashVariant =>
  variant as CashVariant;

export const asInvMoveVariant = (variant: string): InvMoveVariant =>
  variant as InvMoveVariant;

export const asInvSaleVariant = (variant: string): InvSaleVariant =>
  variant as InvSaleVariant;

export const asInvIncomeVariant = (variant: string): InvIncomeVariant =>
  variant as InvIncomeVariant;
