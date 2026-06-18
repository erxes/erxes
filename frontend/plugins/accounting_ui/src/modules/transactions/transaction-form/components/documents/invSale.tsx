import { ITransaction } from '~/modules/transactions/types/Transaction';
import {
  A4Sheet,
  DiscountReceipt,
  FormHeader,
  IDiscountReceiptConfig,
  IReceiptLabels,
  SignLine,
  SimpleItemRows,
  TD,
  TH,
  TwinReceipt,
  TwinSheet,
  buildRows,
  formatNumber,
  getMeta,
  padRows,
  sumAmount,
} from './shared';

// Four Борлуулалт (sales) layouts shipped by the document config screen.
export type InvSaleVariant =
  | 'twin' // inv_sale_1 — side-by-side simple receipts
  | 'location' // inv_sale_2 — single receipt with a Байршил column
  | 'discount' // inv_sale_3 — "Худалдсан" group with a discount block
  | 'numbered'; // inv_sale_4 — "ЗАРЛАГЫН БАРИМТ №" with a "Худалдах" group

// Labels for the shared twin receipt — inv_sale_1.
const TWIN_LABELS: IReceiptLabels = {
  formCode: 'НХМаягт БМ3',
  title: 'Зарлагын баримт',
  orgLabel: 'Байгууллага:',
  partyLabel: 'Хэнд(хаана):',
};

// === inv_sale_2: single receipt with an extra Байршил column.
const LocationReceipt = ({ transaction }: { transaction: ITransaction }) => {
  const { date } = getMeta(transaction);
  const rows = buildRows(transaction);
  const filled = padRows(rows, 5);

  return (
    <A4Sheet paddingX="18mm">
      <FormHeader code="НХМаягт БМ3" />
      <div className="mt-1 border-b border-black pb-1 font-bold">
        Байгууллага:
      </div>
      <div className="mt-3 mb-3 text-center text-[16px] font-bold">
        Зарлагын баримт
      </div>
      <div className="font-bold">Огноо: {date || '20.../.../...'}</div>
      <div className="mt-1 font-bold">Хэнд(хаана):</div>
      <div className="mt-1 mb-2 font-bold">Утга:</div>

      <table className="w-full border-collapse border border-black text-[11px]">
        <thead>
          <tr>
            <th className={`${TH} px-2`}>Бараа материал</th>
            <th className={`${TH} px-2`}>Байршил</th>
            <th className={TH}>Хэмжих нэгж</th>
            <th className={TH}>Тоо</th>
            <th className={TH}>Нэгжийн үнэ</th>
            <th className={TH}>Үнэ</th>
          </tr>
        </thead>
        <SimpleItemRows rows={filled} total={sumAmount(rows)} withLocation />
      </table>

      <div className="mt-6 space-y-2">
        <SignLine label="Хүлээн авсан" />
        <SignLine label="Хүлээлгэн өгсөн" />
      </div>

      <div className="mt-6 flex justify-between text-[11px]">
        <div>
          <span>Шивсэн:</span>
          <span className="ml-1 inline-block w-40 border-b border-dotted border-black" />
        </div>
        <div>
          <span>Хэвлэсэн:</span>
          <span className="ml-1 inline-block w-40 border-b border-dotted border-black" />
        </div>
      </div>
    </A4Sheet>
  );
};

// inv_sale_3 discount-receipt labels — "Худалдсан" with a payable summary.
const DISCOUNT_CONFIG = (date: string): IDiscountReceiptConfig => ({
  formCode: 'НХМаягт БМ3',
  title: 'Зарлагын баримт',
  showDocNo: false,
  dateText: date || '20... он ... сар ... өдөр',
  partyLabel: 'Хэнд(хаана):',
  unitHeader: 'Хэм. нэгж',
  priceHeaderNote: '\\НӨАТ орсон\\',
  groupHeader: 'Худалдсан',
  percentHeader: 'Хөн. хувь',
  discountLabel: '- Хөнгөлөлт:',
  payableLabel: 'Төлбөр:',
  lastSignLabel: 'Хянасан',
  minRows: 5,
});

// === inv_sale_4: numbered "ЗАРЛАГЫН БАРИМТ №" with a "Худалдах" group.
const NumberedReceipt = ({ transaction }: { transaction: ITransaction }) => {
  const { documentNo, date } = getMeta(transaction);
  const rows = buildRows(transaction);
  const total = sumAmount(rows);
  const filled = padRows(rows, 5);

  return (
    <A4Sheet>
      <FormHeader code="НХМаягт БМ-3" />
      <div className="mt-1 border-b border-black pb-1 font-bold">
        Байгууллагын нэр:
      </div>
      <div className="mt-3 mb-3 text-center text-[16px] font-bold uppercase">
        Зарлагын баримт №{documentNo ? ` ${documentNo}` : ''}
      </div>
      <div className="font-bold">{date || '20... он ... сар ... өдөр'}</div>
      <div className="mt-1 font-bold">(Худалдан авагчийн нэр):</div>
      <div className="mt-1 mb-2 font-bold">Утга:</div>

      <table className="w-full border-collapse border border-black text-[11px]">
        <thead>
          <tr>
            <th rowSpan={2} className={`${TH} w-8`}>
              №
            </th>
            <th rowSpan={2} className={`${TH} px-2`}>
              Материалын үнэт зүйлийн нэр, зэрэг, дугаар
            </th>
            <th rowSpan={2} className={TH}>
              Хэмжих нэгж
            </th>
            <th colSpan={3} className={`${TH} px-2`}>
              Худалдах
            </th>
          </tr>
          <tr>
            <th className={TH}>Тоо</th>
            <th className={TH}>Нэгжийн үнэ</th>
            <th className={TH}>Нийт дүн</th>
          </tr>
        </thead>
        <tbody>
          {filled.map(({ key, index, row }) => (
            <tr key={key}>
              <td className={`${TD} py-2 text-center`}>{index + 1}</td>
              <td className={`${TD} px-2 py-2`}>{row?.name || ' '}</td>
              <td className={`${TD} py-2 text-center`}>{row?.unit || ' '}</td>
              <td className={`${TD} py-2 text-right`}>
                {row?.count ? row.count.toLocaleString() : ' '}
              </td>
              <td className={`${TD} py-2 text-right`}>
                {row ? formatNumber(row.unitPrice) : ' '}
              </td>
              <td className={`${TD} py-2 text-right`}>
                {row ? formatNumber(row.amount) : ' '}
              </td>
            </tr>
          ))}
          <tr>
            <td className={TD} />
            <td className={`${TD} px-2 font-medium`}>Дүн:</td>
            <td className={`${TD} text-center`}>X</td>
            <td className={`${TD} text-center`}>X</td>
            <td className={`${TD} text-center`}>X</td>
            <td className={`${TD} text-right font-bold`}>
              {formatNumber(total)}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="mt-6 space-y-2">
        <SignLine label="Хүлээн авсан" />
        <SignLine label="Хүлээлгэн өгсөн" />
        <SignLine label="Шалгасан нягтлан бодогч" />
      </div>
    </A4Sheet>
  );
};

export const PrintInvSaleDocument = ({
  transaction,
  variant = 'numbered',
}: {
  transaction: ITransaction;
  variant?: InvSaleVariant;
}) => {
  switch (variant) {
    case 'twin':
      return (
        <TwinSheet>
          <TwinReceipt
            transaction={transaction}
            labels={TWIN_LABELS}
            minRows={5}
          />
          <TwinReceipt
            transaction={transaction}
            labels={TWIN_LABELS}
            minRows={5}
          />
        </TwinSheet>
      );

    case 'location':
      return <LocationReceipt transaction={transaction} />;

    case 'discount':
      return (
        <DiscountReceipt
          transaction={transaction}
          config={DISCOUNT_CONFIG(getMeta(transaction).date)}
        />
      );

    case 'numbered':
    default:
      return <NumberedReceipt transaction={transaction} />;
  }
};
