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
    { value: 'payer', label: 'Төлөгч' },
    { value: 'responsible', label: 'Хариуцагч' },
  ],
  [TrJournalEnum.CASH]: [
    { value: 'twin-table', label: 'Орлого/Зарлага хүснэгт' },
    { value: 'lined', label: 'Кассын орлогын баримт' },
    { value: 'dotted', label: 'Бэлэн мөнгөний баримт' },
    { value: 'twin-dotted', label: 'Бэлэн мөнгө (2 хувь)' },
  ],
  [TrJournalEnum.INV_MOVE]: [
    { value: 'standard', label: 'Дотоод хөдөлгөөн' },
    { value: 'byPrice', label: 'Дотоод хөдөлгөөн (үнээр)' },
  ],
  [TrJournalEnum.INV_SALE]: [
    { value: 'numbered', label: 'Зарлагын баримт №' },
    { value: 'twin', label: 'Зарлагын баримт (2 хувь)' },
    { value: 'location', label: 'Зарлагын баримт (байршилтай)' },
    { value: 'discount', label: 'Зарлагын баримт (хөнгөлөлттэй)' },
  ],
  [TrJournalEnum.INV_INCOME]: [
    { value: 'numbered', label: 'Орлогын баримт №' },
    { value: 'twin', label: 'Орлогын баримт (2 хувь)' },
    { value: 'simple', label: 'Орлогын баримт (энгийн)' },
    { value: 'discount', label: 'Орлогын баримт (хөнгөлөлттэй)' },
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
