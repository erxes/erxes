import dayjs from 'dayjs';
import { fixNum } from 'erxes-ui';
import { ITransaction } from '~/modules/transactions/types/Transaction';

// Shared building blocks for the printable transaction documents.
// Each document file (invSale, invIncome, invOut, ...) renders a slightly
// different government form, but they all reuse the helpers below.

// Two-decimal, thousand-grouped number — the format every receipt uses.
export const formatNumber = (value: number) =>
  fixNum(value, 2).toLocaleString();

// One sold/received/moved item line built from a transaction detail.
export interface IReceiptRow {
  name: string;
  unit: string;
  count: number;
  unitPrice: number;
  amount: number;
}

// Builds line rows from transaction details. When `withCode` is set the
// product/account code is prefixed to the name ("CODE - Name").
export const buildRows = (
  transaction: ITransaction,
  withCode = false,
): IReceiptRow[] =>
  (transaction?.details || []).map((d) => {
    const count = d.count ?? 0;
    const amount = d.amount ?? count * (d.unitPrice ?? 0);
    const unitPrice = d.unitPrice ?? (count > 0 ? amount / count : amount);
    const code = d.product?.code || d.account?.code || '';
    const name = d.product?.name || d.account?.name || '';

    return {
      name: withCode && code ? `${code} - ${name}` : name,
      unit: d.product?.uom || '',
      count,
      unitPrice,
      amount,
    };
  });

// Common header/party fields shared across the receipt layouts.
export const getMeta = (transaction: ITransaction) => ({
  documentNo: transaction?.number || transaction?.ptrNumber || '',
  date: transaction?.date
    ? dayjs(transaction.date).format('YYYY.MM.DD')
    : '',
  partyName:
    transaction.customer?.firstName || transaction.customer?.code || '',
  description: transaction?.description || '',
});

// Pads `rows` with nulls so the printed table keeps at least `min` lines.
export const padRows = <T,>(rows: T[], min: number): (T | null)[] => [
  ...rows,
  ...Array(Math.max(0, min - rows.length)).fill(null),
];

// Sums the line amounts of a set of receipt rows.
export const sumAmount = (rows: IReceiptRow[]) =>
  rows.reduce((sum, r) => sum + r.amount, 0);

// Top-left form code + the ministry-order note printed on every form.
export const FormHeader = ({ code }: { code: string }) => (
  <div className="flex items-start justify-between text-[11px]">
    <div className="font-medium">{code}</div>
    <div className="text-right leading-tight">
      Сангийн сайдын 2017 оны 347 дугаар
      <br />
      тушаалын хавсралт
    </div>
  </div>
);

// One signature line, e.g. "Хүлээн авсан: ......./......./".
export const SignLine = ({
  label,
  value,
}: {
  label: string;
  value?: string;
}) => (
  <div className="flex items-end gap-2 text-[11px]">
    <span className="shrink-0">
      {label}:{value ? ` ${value}` : ''}
    </span>
    <span className="inline-block flex-1 border-b border-dotted border-black" />
    <span>/</span>
    <span className="inline-block w-56 border-b border-dotted border-black" />
    <span>/</span>
  </div>
);

// A4 portrait print sheet wrapper (id="print-area" drives the print CSS).
export const A4Sheet = ({
  children,
  paddingX = '16mm',
}: {
  children: React.ReactNode;
  paddingX?: string;
}) => (
  <div
    id="print-area"
    className="min-h-[297mm] w-[210mm] bg-white py-[14mm] font-serif text-[12px] leading-snug text-black shadow-sidebar-inset"
    style={{ paddingLeft: paddingX, paddingRight: paddingX }}
  >
    {children}
  </div>
);

// Landscape sheet that prints two side-by-side copies (twin receipts).
export const TwinSheet = ({ children }: { children: React.ReactNode }) => (
  <div
    id="print-area"
    className="min-h-[210mm] w-[297mm] bg-white px-[14mm] py-[14mm] font-serif text-black shadow-sidebar-inset"
  >
    <div className="flex gap-8">{children}</div>
  </div>
);
