import dayjs from 'dayjs';
import { fixNum } from 'erxes-ui';
import { ITransaction } from '~/modules/transactions/types/Transaction';
import { amountToMongolianText } from './numberToWords';
import { keyRows } from './shared';

const formatNumber = (value: number) => fixNum(value, 2).toLocaleString();

// Five Кассын орлого/зарлага layouts shipped by the document config screen.
export type CashVariant =
  | 'twin-table' // cash_1 — side-by-side income/expense receipts with a table
  | 'lined' // cash_2 / cash_5 — single receipt with underlined fields
  | 'dotted' // cash_3 — НХМаягт МХ2 dotted-line receipt
  | 'twin-dotted'; // cash_4 — side-by-side dotted receipts with a stamp box

// The dotted filler line used on the legacy paper forms.
const Dots = ({ className = '' }: { className?: string }) => (
  <span className={`inline-block border-b border-dotted border-black ${className}`} />
);

// Shared header: form code (top-left) + ministry order note (top-right).
const FormHeader = ({ code }: { code: string }) => (
  <div className="flex items-start justify-between text-[11px]">
    <div>{code}</div>
    <div className="text-right leading-tight">
      Сангийн сайдын 2017 оны 347 дугаар тушаалын
      <br />
      хавсралт
    </div>
  </div>
);

// One signature line, e.g. "Захирал: ......./......./".
const SignLine = ({ label }: { label: string }) => (
  <div className="flex items-end gap-2">
    <span className="shrink-0">{label}:</span>
    <Dots className="flex-1" />
    <span>/</span>
    <Dots className="w-32" />
    <span>/</span>
  </div>
);

const getAmount = (transaction: ITransaction) =>
  (transaction?.details || []).reduce(
    (sum, d) => sum + (d.currencyAmount ?? d.amount ?? 0),
    0,
  );

const getCommonFields = (transaction: ITransaction) => {
  const amount = getAmount(transaction);
  return {
    amount,
    amountFormatted: formatNumber(amount),
    amountInWords: amountToMongolianText(amount),
    documentNo: transaction?.number || transaction?.ptrNumber || '',
    date: transaction?.date
      ? dayjs(transaction.date).format('YYYY.MM.DD')
      : '',
    description: transaction?.description || '',
    partyName:
      transaction.customer?.firstName || transaction.customer?.code || '',
  };
};

// === cash_1: side-by-side income / expense receipts with a Данс/Утга/Дүн table.
const TwinTableReceipt = ({
  transaction,
  title,
  partyLabel,
}: {
  transaction: ITransaction;
  title: string;
  partyLabel: string;
}) => {
  const { documentNo, date, details } = {
    ...getCommonFields(transaction),
    details: transaction?.details || [],
  };

  return (
    <div className="flex-1">
      <FormHeader code="НХМаягт МХ1" />
      <div className="mt-2 border-b border-black pb-1">Байгууллага:</div>
      <div className="mt-3 mb-3 text-center text-[14px] font-bold">
        {title} №{documentNo ? ` ${documentNo}` : ''}
      </div>
      <div className="text-[11px]">
        Огноо: <span className="font-bold">{date || '20.../.../...'}</span>
      </div>
      <div className="mt-1 text-[11px]">{partyLabel}:</div>

      <table className="mt-2 w-full border-collapse border border-black text-[11px]">
        <thead>
          <tr>
            <th className="border border-black px-2 py-1 font-medium">Данс</th>
            <th className="border border-black px-2 py-1 font-medium">Утга</th>
            <th className="border border-black px-2 py-1 font-medium">Дүн</th>
          </tr>
        </thead>
        <tbody>
          {keyRows(details.length ? details : [null]).map(({ key, row: d }) => (
            <tr key={key}>
              <td className="border border-black px-2 py-1.5">
                {d?.account?.code || ' '}
              </td>
              <td className="border border-black px-2 py-1.5">
                {d?.account?.name || ' '}
              </td>
              <td className="border border-black px-2 py-1.5 text-right">
                {d ? formatNumber(d.currencyAmount ?? d.amount ?? 0) : ' '}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 text-[11px] font-bold">
        Мөнгөн дүн (үсгээр):
        <Dots className="ml-1 w-40" />
      </div>

      <div className="mt-6 space-y-3 text-[11px]">
        <SignLine label="Ерөнхий захирал" />
        <SignLine label="Гүйцэтгэх захирал" />
        <SignLine label="Ерөнхий нягтлан" />
        <SignLine label="Хүлээн авагч" />
        <SignLine label="Мөнгө тушаагч" />
      </div>

      <div className="mt-6 flex justify-between text-[11px]">
        <div>
          Шивсэн:
          <Dots className="ml-1 w-24" />
        </div>
        <div>
          Хэвлэсэн:
          <Dots className="ml-1 w-24" />
        </div>
      </div>
    </div>
  );
};

// A label with an underlined inline value — used by the lined cash receipt.
const LinedField = ({
  label,
  value,
}: {
  label: string;
  value?: string;
}) => (
  <div className="flex items-end gap-2">
    <span className="shrink-0 font-bold">{label}:</span>
    <span className="flex-1 border-b border-black px-1">{value || ' '}</span>
  </div>
);

// === cash_2 / cash_5: single receipt with underlined inline fields.
const LinedReceipt = ({ transaction }: { transaction: ITransaction }) => {
  const { documentNo, date, partyName, description, amountFormatted } =
    getCommonFields(transaction);

  return (
    <div
      id="print-area"
      className="w-[210mm] min-h-[297mm] bg-white px-[18mm] py-[14mm] font-serif text-[12px] leading-relaxed text-black shadow-sidebar-inset"
    >
      <FormHeader code="НХМаягт МХ1" />
      <div className="mt-3 text-center text-[16px] font-bold">
        Кассын орлогын баримт
      </div>

      <div className="mt-4 flex justify-between text-[11px]">
        <div>Дугаар: {documentNo}</div>
        <div>20.. он .. сар .. өдөр {date}</div>
      </div>

      <div className="mt-3 space-y-4">
        <LinedField label="Байгууллага нэр" />
        <LinedField label="Хэнээс(хаанаас)" value={partyName} />
        <LinedField label="Гүйлгээний утга" value={description} />
        <LinedField label="Мөнгөний дүн" value={amountFormatted} />
      </div>

      <div className="mt-16 space-y-3 pl-32 text-[11px]">
        <SignLine label="Ерөнхий захирал" />
        <SignLine label="Ерөнхий нягтлан" />
        <SignLine label="Хүлээн авагч" />
        <SignLine label="Мөнгө тушаагч" />
      </div>
    </div>
  );
};

// A label above a dotted-underline value — used by the dotted cash receipt.
const DottedField = ({
  label,
  value,
}: {
  label: string;
  value?: string;
}) => (
  <div className="space-y-2">
    <div className="font-bold">{label}:</div>
    <div className="border-b border-dotted border-black pb-0.5">
      {value || ' '}
    </div>
  </div>
);

// === cash_3: НХМаягт МХ2 dotted-line "Бэлэн мөнгөний орлогын баримт".
const DottedReceipt = ({ transaction }: { transaction: ITransaction }) => {
  const { documentNo, date, partyName, description, amountInWords } =
    getCommonFields(transaction);

  return (
    <div
      id="print-area"
      className="w-[210mm] min-h-[297mm] bg-white px-[18mm] py-[14mm] font-serif text-[12px] leading-relaxed text-black shadow-sidebar-inset"
    >
      <div className="flex items-start gap-8 text-[11px]">
        <div className="font-medium">НХМаягт МХ2</div>
        <div className="leading-tight">
          Сангийн сайдын 2017 оны 347 дугаар тушаалын
          <br />
          хавсралт
        </div>
      </div>

      <div className="mt-4 mb-6 text-center text-[16px] font-bold">
        Бэлэн мөнгөний орлогын баримт
      </div>

      <div className="flex justify-between text-[11px]">
        <div>Дугаар: {documentNo}</div>
        <div>20.. он .. сар .. өдөр {date}</div>
      </div>

      <div className="mt-4 space-y-4">
        <DottedField label="Байгууллага нэр" />
        <DottedField label="Хэнээс (хаанаас)" value={partyName} />
        <DottedField label="Гүйлгээний утга" value={description} />
        <DottedField label="Мөнгөний дүн" value={getCommonFields(transaction).amountFormatted} />
        <DottedField label="Мөнгөн дүн(үсгээр)" value={amountInWords} />
        <div className="space-y-2">
          <div className="font-bold">Хавсралт баримт бичиг:</div>
          <div className="border-b border-dotted border-black pb-0.5">&nbsp;</div>
          <div className="border-b border-dotted border-black pb-0.5">&nbsp;</div>
        </div>
      </div>

      <div className="mt-12 space-y-4 pl-24 text-[11px]">
        <SignLine label="Дарга" />
        <SignLine label="Нягтлан бодогч" />
        <SignLine label="Мөнгө тушаагч" />
        <SignLine label="Хүлээн авсан" />
      </div>
    </div>
  );
};

// === cash_4: side-by-side dotted "БЭЛЭН МӨНГӨНИЙ ОРЛОГЫН БАРИМТ" copies.
const TwinDottedCopy = ({ transaction }: { transaction: ITransaction }) => {
  const { documentNo, date, partyName, description } =
    getCommonFields(transaction);

  return (
    <div className="flex-1">
      <FormHeader code="НХМаягт МХ" />
      <div className="mt-3 mb-4 text-center text-[12px] font-bold uppercase">
        Бэлэн мөнгөний орлогын баримт
      </div>

      <div className="flex justify-between text-[11px]">
        <div>Дугаар: {documentNo || '...'}</div>
        <div>
          <span className="font-bold">20...</span> он ... сар ... өдөр {date}
        </div>
      </div>

      <div className="mt-3 space-y-3 text-[11px]">
        <div>Байгууллага нэр:</div>
        <div className="flex flex-wrap items-end gap-1">
          <span>Мөнгө тушаагч:</span>
          <Dots className="w-40" />
          <Dots className="w-20" />
        </div>
        <div>ажилтай</div>
        <div className="flex items-end gap-1">
          <Dots className="w-44" />
          <span>овогтой</span>
        </div>
        <div className="flex items-end gap-1">
          <Dots className="w-40" />
          <span>- нээс</span>
        </div>
        <div>Гүйлгээний утга: {description}</div>
        <div className="flex items-end gap-1">
          <span>Тушаасан мөнгөний дүн:</span>
          <Dots className="flex-1" />
        </div>
        <div>
          <Dots className="w-full" />
        </div>
        <div className="flex items-end gap-1">
          <span>{partyName}</span>
          <Dots className="w-32" />
        </div>
        <div>Хавсралт баримт бичиг:</div>
      </div>

      <div className="mt-12 flex items-end gap-4 text-[11px]">
        <div className="shrink-0">Тэмдэг</div>
        <div className="flex-1 space-y-3">
          <SignLine label="Нягтлан бодогч" />
          <SignLine label="Хүлээн авсан" />
          <SignLine label="Мөнгө тушаагч" />
        </div>
      </div>
    </div>
  );
};

// Twin-layout wrapper used by cash_1 and cash_4 (two receipts per sheet).
const TwinSheet = ({ children }: { children: React.ReactNode }) => (
  <div
    id="print-area"
    className="w-[297mm] min-h-[210mm] bg-white px-[14mm] py-[14mm] font-serif text-black shadow-sidebar-inset"
  >
    <div className="flex gap-8">{children}</div>
  </div>
);

export const PrintCashDocument = ({
  transaction,
  variant = 'lined',
}: {
  transaction: ITransaction;
  variant?: CashVariant;
}) => {
  switch (variant) {
    case 'twin-table':
      return (
        <TwinSheet>
          <TwinTableReceipt
            transaction={transaction}
            title="Кассын орлогын баримт"
            partyLabel="Хэнээс(хаанаас)"
          />
          <TwinTableReceipt
            transaction={transaction}
            title="Кассын зарлагын баримт"
            partyLabel="Хэнд(хаана)"
          />
        </TwinSheet>
      );

    case 'twin-dotted':
      return (
        <TwinSheet>
          <TwinDottedCopy transaction={transaction} />
          <TwinDottedCopy transaction={transaction} />
        </TwinSheet>
      );

    case 'dotted':
      return <DottedReceipt transaction={transaction} />;

    case 'lined':
    default:
      return <LinedReceipt transaction={transaction} />;
  }
};

// Ready-to-register variants for the print document registry.
export const PrintCashTwinTableDocument = ({
  transaction,
}: {
  transaction: ITransaction;
}) => <PrintCashDocument transaction={transaction} variant="twin-table" />;

export const PrintCashLinedDocument = ({
  transaction,
}: {
  transaction: ITransaction;
}) => <PrintCashDocument transaction={transaction} variant="lined" />;

export const PrintCashDottedDocument = ({
  transaction,
}: {
  transaction: ITransaction;
}) => <PrintCashDocument transaction={transaction} variant="dotted" />;

export const PrintCashTwinDottedDocument = ({
  transaction,
}: {
  transaction: ITransaction;
}) => <PrintCashDocument transaction={transaction} variant="twin-dotted" />;
