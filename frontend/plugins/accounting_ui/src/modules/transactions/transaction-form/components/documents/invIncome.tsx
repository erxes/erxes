import { ITransaction } from '~/modules/transactions/types/Transaction';
import {
  A4Sheet,
  DiscountReceipt,
  FormHeader,
  IDiscountReceiptConfig,
  IReceiptLabels,
  NumberedItemRows,
  NumberedTableHead,
  NumberedTotalRow,
  SignLine,
  SimpleReceipt,
  TwinReceipt,
  TwinSheet,
  buildRows,
  getMeta,
  padRows,
  sumAmount,
} from './shared';

// Four Бараа материалын орлого (inventory income) layouts.
export type InvIncomeVariant =
  | 'twin' // inv_income_1 — side-by-side simple receipts
  | 'simple' // inv_income_2 — single simple receipt
  | 'discount' // inv_income_3 — "Худалдаж авсан" group with a discount block
  | 'numbered'; // inv_income_4 — "ОРЛОГЫН БАРИМТ №" with a "Хүлээн авсан" group

// Labels that turn the shared sale-style receipt into an income receipt.
const TWIN_LABELS: IReceiptLabels = {
  formCode: 'НХМаягт БМ2',
  title: 'Орлогын баримт ...',
  orgLabel: 'Байгууллага: ..............',
  partyLabel: 'Хэнээс(хаанаас):',
};

const SIMPLE_LABELS: IReceiptLabels = {
  formCode: 'НХМаягт БМ2',
  title: 'Орлогын баримт',
  orgLabel: 'Байгууллага:',
  partyLabel: 'Хэнээс(хаанаас):',
};

// inv_income_3 discount-receipt labels — "Худалдаж авсан" with a grand total.
const DISCOUNT_CONFIG: IDiscountReceiptConfig = {
  formCode: 'НХМаягт БМ3',
  title: 'Орлогын баримт',
  showDocNo: true,
  dateText: 'Огноо: 20.../.../...',
  partyLabel: 'Хэнээс(хаанаас):',
  unitHeader: 'Хэм,нэгж',
  groupHeader: 'Худалдаж авсан',
  percentHeader: 'Хөн,хувь',
  discountLabel: 'Хөнгөлөлт:',
  payableLabel: 'Нийт дүн:',
  lastSignLabel: 'Шалгасан нягтлан бодогч',
  minRows: 4,
};

// === inv_income_4: numbered "ОРЛОГЫН БАРИМТ №" with a "Хүлээн авсан" group.
const NumberedReceipt = ({ transaction }: { transaction: ITransaction }) => {
  const { documentNo } = getMeta(transaction);
  const rows = buildRows(transaction);
  const total = sumAmount(rows);
  const filled = padRows(rows, 5);

  return (
    <A4Sheet>
      <FormHeader code="НХМаягт БМ-2" />
      <div className="mt-1 border-b border-black pb-1 font-bold">
        Байгууллагын нэр:
      </div>
      <div className="mt-3 mb-3 text-center text-[16px] font-bold uppercase">
        Орлогын баримт №{documentNo ? ` ${documentNo}` : ''}
      </div>
      <div className="font-bold">20... он ... сар ... өдөр</div>
      <div className="mt-1 font-bold">Бэлтгэн нийлүүлэгчийн нэр:</div>
      <div className="mt-1 mb-2 font-bold">Утга:</div>

      <table className="w-full border-collapse border border-black text-[11px]">
        <NumberedTableHead />
        <tbody>
          <NumberedItemRows rows={filled} />
          <NumberedTotalRow total={total} />
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

export const PrintInvIncomeDocument = ({
  transaction,
  variant = 'numbered',
}: {
  transaction: ITransaction;
  variant?: InvIncomeVariant;
}) => {
  switch (variant) {
    case 'twin':
      return (
        <TwinSheet>
          <TwinReceipt
            transaction={transaction}
            labels={TWIN_LABELS}
            minRows={2}
          />
          <TwinReceipt
            transaction={transaction}
            labels={TWIN_LABELS}
            minRows={2}
          />
        </TwinSheet>
      );

    case 'simple':
      return (
        <SimpleReceipt
          transaction={transaction}
          labels={SIMPLE_LABELS}
          minRows={5}
        />
      );

    case 'discount':
      return (
        <DiscountReceipt transaction={transaction} config={DISCOUNT_CONFIG} />
      );

    case 'numbered':
    default:
      return <NumberedReceipt transaction={transaction} />;
  }
};
