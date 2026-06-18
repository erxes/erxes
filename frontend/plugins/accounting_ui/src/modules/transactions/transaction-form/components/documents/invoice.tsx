import dayjs from 'dayjs';
import { fixNum } from 'erxes-ui';
import { ITransaction, ITrDetail } from '~/modules/transactions/types/Transaction';
import { amountToMongolianText } from './numberToWords';
import { keyRows } from './shared';

const formatNumber = (value: number) => fixNum(value, 2).toLocaleString();

// The two НХМаягт Т1 invoice layouts differ only in a few labels and the
// closing block, so they share one component switched by `variant`.
type InvoiceVariant = 'payer' | 'responsible';

const VARIANT_CONFIG: Record<
  InvoiceVariant,
  {
    formCode: string;
    counterpartyLabel: string;
    accountNumberLabel: string;
    showStamp: boolean;
  }
> = {
  // invoice_1.png — "Төлөгч" with a "Данс №" contract line layout.
  payer: {
    formCode: 'НХМаягт Т1',
    counterpartyLabel: 'Төлөгч',
    accountNumberLabel: 'Дансны дугаар',
    showStamp: false,
  },
  // invoice_2.png — "Хариуцагч" with a (Тамга) stamp marker.
  responsible: {
    formCode: 'НХМаягт Т-1',
    counterpartyLabel: 'Хариуцагч',
    accountNumberLabel: 'Банкны дансны дугаар',
    showStamp: true,
  },
};

// Item line of the invoice — one transaction detail.
interface IInvoiceRow {
  description: string;
  count: number;
  unitPrice: number;
  amount: number;
}

const buildRows = (details: ITrDetail[]): IInvoiceRow[] =>
  details.map((d) => {
    const amount = d.currencyAmount ?? d.amount ?? 0;
    const count = d.count ?? 0;
    const unitPrice =
      d.unitPrice ?? (count > 0 ? amount / count : amount);

    return {
      description: d.product?.name || d.account?.name || '',
      count,
      unitPrice,
      amount,
    };
  });

export const PrintInvoiceDocument = ({
  transaction,
  variant = 'payer',
}: {
  transaction: ITransaction;
  variant?: InvoiceVariant;
}) => {
  const config = VARIANT_CONFIG[variant];

  const details = transaction?.details || [];
  const rows = buildRows(details);

  const subTotal = rows.reduce((sum, r) => sum + r.amount, 0);
  const vatAmount = transaction?.vatAmount ?? 0;
  const total = subTotal + vatAmount;
  const amountInWords = amountToMongolianText(total);

  // Issuer ("Нэхэмжлэгч") — the company that issues the invoice.
  const issuerAccount = details[0]?.account;
  const issuerBank = issuerAccount?.extra?.bank || '';
  const issuerBankAccount = issuerAccount?.extra?.bankAccount || '';

  // Counterparty ("Төлөгч" / "Хариуцагч") — the customer.
  const counterpartyName =
    transaction.customer?.firstName ||
    [transaction.customer?.firstName, transaction.customer?.lastName]
      .filter(Boolean)
      .join(' ') ||
    transaction.customer?.code ||
    '';
  const counterpartyPhone = transaction.customer?.primaryPhone || '';
  const counterpartyEmail = transaction.customer?.primaryEmail || '';

  const documentNo = transaction?.number || transaction?.ptrNumber || '';

  const transactionDate = transaction?.date
    ? dayjs(transaction.date).format('YYYY.MM.DD')
    : '';

  return (
    <div
      id="print-area"
      className="w-[210mm] min-h-[297mm] bg-white px-[18mm] py-[14mm] font-serif text-[12px] leading-snug text-black shadow-sidebar-inset"
    >
      <div className="flex items-start justify-between">
        <div className="font-medium">{config.formCode}</div>
        <div className="text-right leading-tight">
          Сангийн сайдын 2017 оны 347 дугаар
          <br />
          тушаалын хавсралт
        </div>
      </div>

      <div className="mt-4 mb-6 text-center">
        <div className="text-[18px] font-bold uppercase tracking-wide">
          Нэхэмжлэх №{documentNo ? ` ${documentNo}` : ''}
        </div>
      </div>

      <div className="flex gap-8">
        {/* Issuer side */}
        <div className="w-1/2 space-y-1">
          <div className="font-bold">Нэхэмжлэгч:</div>
          <div>Байгууллагын нэр:</div>
          <div>Утас, факс:</div>
          <div>Э-шуудан:</div>
          <table className="mt-2 w-full border-collapse border border-black/60">
            <thead>
              <tr>
                <th
                  scope="col"
                  className="w-1/2 border border-black/60 px-2 py-1 text-left font-medium"
                >
                  Банкны нэр
                </th>
                <th
                  scope="col"
                  className="w-1/2 border border-black/60 px-2 py-1 text-left font-medium"
                >
                  {config.accountNumberLabel}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black/60 px-2 py-2.5">
                  {issuerBank}
                </td>
                <td className="border border-black/60 px-2 py-2.5">
                  {issuerBankAccount}
                </td>
              </tr>
              <tr>
                <td className="border border-black/60 px-2 py-2.5">&nbsp;</td>
                <td className="border border-black/60 px-2 py-2.5">&nbsp;</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Counterparty side */}
        <div className="w-1/2 space-y-2">
          <div className="font-bold">{config.counterpartyLabel}:</div>
          <div>Байгууллагын нэр: {counterpartyName}</div>
          <div>Утас, факс: {counterpartyPhone}</div>
          <div>Э-шуудан: {counterpartyEmail}</div>
          <div>
            Гэрээний №: ............................................
          </div>
          <div className="pt-3">
            Нэхэмжилсэн огноо:{' '}
            {transactionDate || '20...-...-...'}
          </div>
          <div>Төлбөр хийх хугацаа: 20...-...-...</div>
        </div>
      </div>

      <table className="mt-6 w-full border-collapse border border-black/60 text-[12px]">
        <thead>
          <tr className="bg-black/6">
            <th className="w-8 border border-black/60 px-2 py-1 text-center font-medium">
              №
            </th>
            <th className="border border-black/60 px-2 py-1 text-left font-medium">
              Гүйлгээний утга
            </th>
            <th className="border border-black/60 px-2 py-1 text-right font-medium">
              Тоо хэмжээ
            </th>
            <th className="border border-black/60 px-2 py-1 text-right font-medium">
              Нэгжийн үнэ
            </th>
            <th className="border border-black/60 px-2 py-1 text-right font-medium">
              Нийт үнэ
            </th>
          </tr>
        </thead>
        <tbody>
          {keyRows(rows).map(({ key, index, row }) => (
            <tr key={key}>
              <td className="border border-black/60 px-2 py-1.5 text-center">
                {index + 1}
              </td>
              <td className="border border-black/60 px-2 py-1.5">
                {row?.description || ' '}
              </td>
              <td className="border border-black/60 px-2 py-1.5 text-right">
                {row?.count ? row.count.toLocaleString() : ' '}
              </td>
              <td className="border border-black/60 px-2 py-1.5 text-right">
                {row?.unitPrice ? formatNumber(row.unitPrice) : ' '}
              </td>
              <td className="border border-black/60 px-2 py-1.5 text-right">
                {formatNumber(row.amount)}
              </td>
            </tr>
          ))}
          <tr>
            <td
              colSpan={4}
              className="border border-black/60 px-2 py-1.5 text-right font-medium"
            >
              Дүн
            </td>
            <td className="border border-black/60 px-2 py-1.5 text-right">
              {formatNumber(subTotal)}
            </td>
          </tr>
          <tr>
            <td
              colSpan={4}
              className="border border-black/60 px-2 py-1.5 text-right font-medium"
            >
              НӨАТ
            </td>
            <td className="border border-black/60 px-2 py-1.5 text-right">
              {formatNumber(vatAmount)}
            </td>
          </tr>
          <tr className="bg-black/6">
            <td
              colSpan={4}
              className="border border-black/60 px-2 py-1.5 text-right font-bold"
            >
              Нийт дүн
            </td>
            <td className="border border-black/60 px-2 py-1.5 text-right font-bold">
              {formatNumber(total)}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="mt-4">
        <span className="font-bold">Мөнгөн дүн (үсгээр):</span>{' '}
        {amountInWords}
      </div>

      {config.showStamp && <div className="mt-3">(Тамга)</div>}

      <div className="mt-10 space-y-6 pl-8">
        <div>
          Захирал: .................................................../
          ........................../
        </div>
        <div>
          Нягтлан бодогч: ........................................./
          ........................../
        </div>
      </div>
    </div>
  );
};

// Two ready-to-register variants for the print document registry.
export const PrintInvoicePayerDocument = ({
  transaction,
}: {
  transaction: ITransaction;
}) => <PrintInvoiceDocument transaction={transaction} variant="payer" />;

export const PrintInvoiceResponsibleDocument = ({
  transaction,
}: {
  transaction: ITransaction;
}) => <PrintInvoiceDocument transaction={transaction} variant="responsible" />;
