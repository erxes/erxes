import dayjs from 'dayjs';
import { ITransaction } from '~/modules/transactions/types/Transaction';

export const PrintBankDocument = ({ transaction }: {transaction: ITransaction}) => {
  const detail = transaction?.details?.[0];

  const amount = detail?.currencyAmount ?? detail?.amount ?? transaction?.sumDt ?? '';

  const amountFormatted =
    amount !== ''
      ? Number(amount).toLocaleString(undefined, {
          minimumFractionDigits: 2,
        })
      : '';

  // const amountInWords =
  //   amount !== '' ? numberToWord(amount) : '';

  const payerBank = detail?.account?.extra?.bank || '';
  const debitAccount = detail?.account?.extra?.bankAccount || '';

  const receiverBank = transaction?.extraData?.bank || '';
  const creditAccount = transaction?.extraData?.bankAccount || '';

  const description = transaction?.description || '';

  const transactionDate = transaction?.date
    ? dayjs(transaction.date).format('YYYY.MM.DD')
    : '';

  return (
    <div
      id="print-area"
      className="w-[210mm] min-h-[297mm] mx-auto px-[15mm] py-[10mm] text-[12px] font-serif text-black bg-white"
    >
      <div className="text-center mb-4">
        <div className="text-[18px] font-bold tracking-wide">
          ТӨЛБӨРИЙН ДААЛГАВАР
        </div>
      </div>

      <table className="w-full text-[12px]">
        <tbody>
          <tr>
            <td className="py-1 w-[120px]">№:</td>
            <td className="py-1 w-[200px] font-bold">{transaction?._id}</td>
            <td className="py-1" colSpan={2}></td>
            <td className="py-1 text-right" colSpan={2}>
              {dayjs(transaction.date).format('YYYY.MM.DD')}
            </td>
          </tr>

          <tr>
            <td className="py-1">Төлөгчийн нэр:</td>
            <td className="py-1">
              {transaction.customer?.firstName || transaction.customer?.code || '-'}
            </td>
            <td className="py-1" colSpan={4}></td>
          </tr>

          <tr>
            <td className="py-1">Хүлээн авагч:</td>
            <td className="py-1"></td>
            <td className="py-1 pl-2">Данс</td>
            <td className="py-1"></td>
            <td className="py-1 pl-2" colSpan={2}>
              Дүн
            </td>
          </tr>

          <tr>
            <td className="border px-2">Төлөгчийн банк</td>
            <td className="border px-2">{payerBank}</td>
            <td className="border px-2">Дебит данс</td>
            <td className="border px-2">{debitAccount}</td>
            <td className="border px-2" colSpan={2}></td>
          </tr>
          <tr>
            <td className="border px-2">Хүлээн авагчийн банк</td>
            <td className="border px-2">{receiverBank}</td>
            <td className="border px-2">Кредит данс</td>
            <td className="border px-2">{creditAccount}</td>
            <td className="border px-2 text-right font-bold" colSpan={2}>
              {amountFormatted}
            </td>
          </tr>

          <tr>
            <td className="border px-2">Мөнгөн дүн (үсгээр)</td>
            <td className="border px-2" colSpan={3}>
              {/* Наян сая төгрөг */}
            </td>
            <td className="border px-2" colSpan={2}>
              ... хоног торгууль ... төг ... мөн
            </td>
          </tr>

          <tr>
            <td className="border px-2" colSpan={4}>
              Барааг хүлээн авсан буюу ажил гүйцэтгэсэн: {transactionDate}
            </td>
            <td className="border px-2" colSpan={2}>
              Дүн(торгуультай)
            </td>
          </tr>

          <tr>
            <td className="border px-2" colSpan={4}>
              Төлбөрийн зориулалт:
            </td>
            <td className="border px-2">Гүйлгээний утга</td>
            <td className="border px-2"></td>
          </tr>

          <tr>
            <td className="border px-2" colSpan={4} rowSpan={4}>
              {description}
            </td>
            <td className="border px-2">Төлбөрийн зориулалт</td>
            <td className="border px-2"></td>
          </tr>

          <tr>
            <td className="border px-2">Төлөх</td>
            <td className="border px-2"></td>
          </tr>

          <tr>
            <td className="border px-2">Төлбөрийн ээлж</td>
            <td className="border px-2"></td>
          </tr>
        </tbody>
      </table>

      <div className="flex justify-between mt-10 text-[12px]">
        <div className="w-1/2 text-center">
          <div className="mb-10">Ерөнхий нягтлан бодогч</div>
          <div className="border-t border-black w-48 mx-auto"></div>
        </div>

        <div className="w-1/2 text-center">
          <div className="mb-10">Гарын үсэг / Тамга</div>
          <div className="border-t border-black w-48 mx-auto"></div>
        </div>
      </div>
    </div>
  );
};