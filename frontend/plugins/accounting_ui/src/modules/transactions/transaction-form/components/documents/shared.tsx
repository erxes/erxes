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

// A printed table row paired with a stable React key. Padding rows are
// blanks; their position in the form is fixed, so a positional key is stable.
export interface IKeyedRow<T> {
  key: string;
  index: number; // 0-based position, for tables that print a row number
  row: T | null;
}

// Pads `rows` with blank entries so the printed table keeps at least `min`
// lines, returning each entry with a stable key for React rendering.
export const padRows = <T,>(rows: T[], min: number): IKeyedRow<T>[] => {
  const blanks = Math.max(0, min - rows.length);
  return [
    ...rows.map((row, i) => ({ key: `row-${i}`, index: i, row })),
    ...Array.from({ length: blanks }, (_, i) => ({
      key: `blank-${i}`,
      index: rows.length + i,
      row: null,
    })),
  ];
};

// Pairs each row with a stable key (no padding) — for tables printed without
// a fixed minimum line count.
export const keyRows = <T,>(rows: T[]): IKeyedRow<T>[] =>
  rows.map((row, i) => ({ key: `row-${i}`, index: i, row }));

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

// Reusable table cell class names — every receipt grid uses the same borders.
export const TH = 'border border-black px-1 py-1 font-medium';
export const TD = 'border border-black px-1 py-1.5';

// A labelled key/value row with a shaded label cell — used by the bank
// payment order and the generic transaction voucher.
export const Field = ({
  label,
  value,
  className = '',
}: {
  label: string;
  value?: React.ReactNode;
  className?: string;
}) => (
  <div className={`flex border-b border-black/60 ${className}`}>
    <div className="w-[42%] shrink-0 bg-black/4 px-2 py-1 font-medium">
      {label}
    </div>
    <div className="flex-1 px-2 py-1">{value || ' '}</div>
  </div>
);

// The centered title + "№ ... / Огноо ..." line printed at the top of the
// bank payment order and the generic transaction voucher.
export const VoucherHeader = ({
  title,
  documentNo,
  date,
}: {
  title: string;
  documentNo: string;
  date: string;
}) => (
  <>
    <div className="mb-6 text-center">
      <div className="text-[20px] font-bold uppercase tracking-wide">
        {title}
      </div>
      <div className="mx-auto mt-1 h-0.5 w-28 bg-black" />
    </div>

    <div className="mb-4 flex items-end justify-between text-[12px]">
      <div>
        <span className="font-medium">№:</span>{' '}
        <span className="font-bold">{documentNo || ' '}</span>
      </div>
      <div>
        <span className="font-medium">Огноо:</span>{' '}
        <span className="font-bold">{date || ' '}</span>
      </div>
    </div>
  </>
);

// === Shared receipt layouts ================================================
// invSale and invIncome print near-identical forms; the components below take
// the few differing labels as props so both files can reuse one implementation.

// Labels that differ between a sale receipt and an income receipt.
export interface IReceiptLabels {
  formCode: string;
  title: string; // centered document title
  orgLabel: string; // "Байгууллага:" / "Байгууллагын нэр:"
  partyLabel: string; // "Хэнд(хаана):" / "Хэнээс(хаанаас):"
}

// The simple item table body shared by the twin/simple/location receipts.
// With `withLocation` an extra (empty) "Байршил" column is rendered, which
// the inv_sale_2 layout needs.
export const SimpleItemRows = ({
  rows,
  total,
  withLocation = false,
}: {
  rows: IKeyedRow<IReceiptRow>[];
  total: number;
  withLocation?: boolean;
}) => (
  <tbody>
    {rows.map(({ key, row }) => (
      <tr key={key}>
        <td className={`${TD}${withLocation ? ' px-2' : ''}`}>
          {row?.name || ' '}
        </td>
        {withLocation && <td className={`${TD} px-2`}>&nbsp;</td>}
        <td className={`${TD} text-center`}>{row?.unit || ' '}</td>
        <td className={`${TD} text-right`}>
          {row?.count ? row.count.toLocaleString() : ' '}
        </td>
        <td className={`${TD} text-right`}>
          {row ? formatNumber(row.unitPrice) : ' '}
        </td>
        <td className={`${TD} text-right`}>
          {row ? formatNumber(row.amount) : ' '}
        </td>
      </tr>
    ))}
    <tr>
      <td className={`${TD}${withLocation ? ' px-2' : ''} font-medium`}>
        Дүн:
      </td>
      {withLocation && <td className={`${TD} px-2 text-center`}>X</td>}
      <td className={`${TD} text-center`}>X</td>
      <td className={`${TD} text-center`}>X</td>
      <td className={`${TD} text-center`}>X</td>
      <td className={`${TD} text-right font-bold`}>{formatNumber(total)}</td>
    </tr>
  </tbody>
);

// The five-column item table (header + body) used by the simple layouts.
const SimpleItemTable = ({
  rows,
  total,
}: {
  rows: IKeyedRow<IReceiptRow>[];
  total: number;
}) => (
  <table className="w-full border-collapse border border-black text-[11px]">
    <thead>
      <tr>
        <th className={TH}>Бараа материал</th>
        <th className={TH}>Хэмжих нэгж</th>
        <th className={TH}>Тоо</th>
        <th className={TH}>Нэгжийн үнэ</th>
        <th className={TH}>Үнэ</th>
      </tr>
    </thead>
    <SimpleItemRows rows={rows} total={total} />
  </table>
);

// One side of a twin (two-per-sheet) simple receipt — used by inv_sale_1
// and inv_income_1. `minRows` keeps the printed form its fixed height.
export const TwinReceipt = ({
  transaction,
  labels,
  minRows,
}: {
  transaction: ITransaction;
  labels: IReceiptLabels;
  minRows: number;
}) => {
  const rows = buildRows(transaction);
  const filled = padRows(rows, minRows);

  return (
    <div className="flex-1">
      <FormHeader code={labels.formCode} />
      <div className="mt-1 border-b border-black pb-1 font-bold">
        {labels.orgLabel}
      </div>
      <div className="mt-2 mb-2 text-center text-[15px] font-bold">
        {labels.title}
      </div>
      <div className="text-[11px] font-bold">Огноо: 20.../.../...</div>
      <div className="mt-1 text-[11px] font-bold">{labels.partyLabel}</div>
      <div className="mt-1 mb-2 text-[11px] font-bold">Утга:</div>

      <SimpleItemTable rows={filled} total={sumAmount(rows)} />

      <div className="mt-4 space-y-2">
        <SignLine label="Хүлээн авсан" />
        <SignLine label="Хүлээлгэн өгсөн" />
      </div>
    </div>
  );
};

// A single-copy A4 simple receipt — used by inv_income_2. The `partyLabel`
// and `title` differ per journal; the table itself is the shared one.
export const SimpleReceipt = ({
  transaction,
  labels,
  minRows,
}: {
  transaction: ITransaction;
  labels: IReceiptLabels;
  minRows: number;
}) => {
  const rows = buildRows(transaction);
  const filled = padRows(rows, minRows);

  return (
    <A4Sheet paddingX="18mm">
      <FormHeader code={labels.formCode} />
      <div className="mt-1 border-b border-black pb-1 font-bold">
        {labels.orgLabel}
      </div>
      <div className="mt-3 mb-3 text-center text-[16px] font-bold">
        {labels.title}
      </div>
      <div className="font-bold">Огноо: 20.../.../...</div>
      <div className="mt-1 font-bold">{labels.partyLabel}</div>
      <div className="mt-1 mb-2 font-bold">Утга:</div>

      <SimpleItemTable rows={filled} total={sumAmount(rows)} />

      <div className="mt-6 space-y-2">
        <SignLine label="Хүлээн авсан" />
        <SignLine label="Хүлээлгэн өгсөн" />
        <SignLine label="Шалгасан нягтлан бодогч" />
      </div>
    </A4Sheet>
  );
};

// The numbered "№ ... / Хүлээн авсан" table head shared by inv_income_4 and
// the sale-return form (both print НХМаягт БМ-2).
export const NumberedTableHead = () => (
  <thead>
    <tr>
      <th rowSpan={2} className={`${TH} w-8`}>
        №
      </th>
      <th rowSpan={2} className={`${TH} px-2`}>
        Материалын үнэт зүйлийн нэр,зэрэг, дугаар
      </th>
      <th rowSpan={2} className={TH}>
        Хэмжих нэгж
      </th>
      <th rowSpan={2} className={`${TH} px-2`}>
        Нэг бүрийн үнэ
      </th>
      <th colSpan={2} className={`${TH} px-2`}>
        Хүлээн авсан
      </th>
    </tr>
    <tr>
      <th className={TH}>Тоо</th>
      <th className={TH}>Үнэ</th>
    </tr>
  </thead>
);

// The numbered item rows (idx, name, unit, price, count, amount) shared by
// the income-numbered and sale-return tables.
export const NumberedItemRows = ({
  rows,
}: {
  rows: IKeyedRow<IReceiptRow>[];
}) => (
  <>
    {rows.map(({ key, index, row }) => (
      <tr key={key}>
        <td className={`${TD} py-2 text-center`}>{index + 1}</td>
        <td className={`${TD} px-2 py-2`}>{row?.name || ' '}</td>
        <td className={`${TD} py-2 text-center`}>{row?.unit || ' '}</td>
        <td className={`${TD} px-2 py-2 text-right`}>
          {row ? formatNumber(row.unitPrice) : ' '}
        </td>
        <td className={`${TD} py-2 text-right`}>
          {row?.count ? fixNum(row.count, 2).toLocaleString() : ' '}
        </td>
        <td className={`${TD} py-2 text-right`}>
          {row ? formatNumber(row.amount) : ' '}
        </td>
      </tr>
    ))}
  </>
);

// The "Дүн:" subtotal row that closes the numbered (six-column) tables.
export const NumberedTotalRow = ({ total }: { total: number }) => (
  <tr>
    <td className={TD} />
    <td className={`${TD} px-2 font-medium`}>Дүн:</td>
    <td className={`${TD} text-center`}>X</td>
    <td className={`${TD} px-2 text-center`}>X</td>
    <td className={`${TD} text-center`}>X</td>
    <td className={`${TD} text-right font-bold`}>{formatNumber(total)}</td>
  </tr>
);

// The labels/values that vary between the inv_sale and inv_income discount
// receipts (inv_sale_3 / inv_income_3) — every other markup is identical.
export interface IDiscountReceiptConfig {
  formCode: string;
  title: string; // centered title; income appends the document number
  showDocNo: boolean; // income shows "№{documentNo}" after the title
  dateText: string; // pre-formatted date / placeholder line
  partyLabel: string; // "Хэнд(хаана):" / "Хэнээс(хаанаас):"
  unitHeader: string; // "Хэм. нэгж" / "Хэм,нэгж"
  priceHeaderNote?: string; // invSale prints "\НӨАТ орсон\" under the price
  groupHeader: string; // "Худалдсан" / "Худалдаж авсан"
  percentHeader: string; // "Хөн. хувь" / "Хөн,хувь"
  discountLabel: string; // "- Хөнгөлөлт:" / "Хөнгөлөлт:"
  payableLabel: string; // "Төлбөр:" / "Нийт дүн:"
  lastSignLabel: string; // "Хянасан" / "Шалгасан нягтлан бодогч"
  minRows: number;
}

// The discount receipt shared by inv_sale_3 and inv_income_3 — a grouped
// header table with a discount + payable summary block.
export const DiscountReceipt = ({
  transaction,
  config,
}: {
  transaction: ITransaction;
  config: IDiscountReceiptConfig;
}) => {
  const { documentNo } = getMeta(transaction);
  const rows = buildRows(transaction);
  const total = sumAmount(rows);
  const discount = transaction?.extraData?.discount ?? 0;
  const payable = total - discount;
  const filled = padRows(rows, config.minRows);

  return (
    <A4Sheet>
      <FormHeader code={config.formCode} />
      <div className="mt-1 border-b border-black pb-1 font-bold">
        Байгууллага:
      </div>
      <div className="mt-3 mb-3 text-center text-[16px] font-bold">
        {config.title}
        {config.showDocNo && documentNo ? ` №${documentNo}` : ''}
      </div>
      <div className="font-bold">{config.dateText}</div>
      <div className="mt-1 font-bold">{config.partyLabel}</div>
      <div className="mt-1 mb-2 font-bold">Утга:</div>

      <table className="w-full border-collapse border border-black text-[11px]">
        <thead>
          <tr>
            <th rowSpan={2} className={`${TH} px-2`}>
              Бараа материал
            </th>
            <th rowSpan={2} className={TH}>
              {config.unitHeader}
            </th>
            <th rowSpan={2} className={`${TH} px-2`}>
              Нэгж үнэ
              {config.priceHeaderNote ? (
                <>
                  <br />
                  {config.priceHeaderNote}
                </>
              ) : null}
            </th>
            <th colSpan={4} className={`${TH} px-2`}>
              {config.groupHeader}
            </th>
          </tr>
          <tr>
            <th className={TH}>Тоо</th>
            <th className={TH}>{config.percentHeader}</th>
            <th className={TH}>Хөнгөлөлт</th>
            <th className={TH}>Дүн</th>
          </tr>
        </thead>
        <tbody>
          {filled.map(({ key, row }) => (
            <tr key={key}>
              <td className={`${TD} px-2`}>{row?.name || ' '}</td>
              <td className={`${TD} text-center`}>{row?.unit || ' '}</td>
              <td className={`${TD} px-2 text-right`}>
                {row ? formatNumber(row.unitPrice) : ' '}
              </td>
              <td className={`${TD} text-right`}>
                {row?.count ? row.count.toLocaleString() : ' '}
              </td>
              <td className={`${TD} text-right`}>&nbsp;</td>
              <td className={`${TD} text-right`}>&nbsp;</td>
              <td className={`${TD} text-right`}>
                {row ? formatNumber(row.amount) : ' '}
              </td>
            </tr>
          ))}
          <tr>
            <td className={`${TD} px-2 font-medium`}>Дүн:</td>
            <td className={`${TD} text-center`}>X</td>
            <td className={`${TD} px-2 text-center`}>X</td>
            <td className={`${TD} text-center`}>X</td>
            <td className={`${TD} text-center`}>X</td>
            <td className={TD} />
            <td className={`${TD} text-right font-bold`}>
              {formatNumber(total)}
            </td>
          </tr>
          <tr>
            <td colSpan={6} className={`${TD} px-2 text-right font-medium`}>
              {config.discountLabel}
            </td>
            <td className={`${TD} text-right`}>{formatNumber(discount)}</td>
          </tr>
          <tr>
            <td colSpan={6} className={`${TD} px-2 text-right font-medium`}>
              {config.payableLabel}
            </td>
            <td className={`${TD} text-right font-bold`}>
              {formatNumber(payable)}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="mt-6 space-y-2">
        <SignLine label="Хүлээн авсан" />
        <SignLine label="Хүлээлгэн өгсөн" />
        <SignLine label={config.lastSignLabel} />
      </div>
    </A4Sheet>
  );
};
