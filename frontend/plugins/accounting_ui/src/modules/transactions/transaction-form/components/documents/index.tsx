import { ITransaction } from '~/modules/transactions/types/Transaction';
import { TrJournalEnum } from '~/modules/transactions/types/constants';
import { PRINT_DOCUMENTS } from '../../contants/printDocuments';
import { PrintInvoiceDocument } from './invoice';
import { PrintCashDocument } from './cash';
import { PrintInvIncomeDocument } from './invIncome';
import { PrintInvMoveDocument } from './invMove';
import { PrintInvSaleDocument } from './invSale';
import {
  asCashVariant,
  asInvIncomeVariant,
  asInvMoveVariant,
  asInvSaleVariant,
} from './variants';

export const PrintBody = ({
  transaction,
  variant,
}: {
  transaction: ITransaction;
  // Selected layout for journals that offer several — see DOCUMENT_VARIANTS.
  variant?: string;
}) => {
  if (transaction.journal === TrJournalEnum.RECEIVABLE) {
    return (
      <PrintInvoiceDocument
        transaction={transaction}
        variant={variant === 'responsible' ? 'responsible' : 'payer'}
      />
    );
  }

  if (transaction.journal === TrJournalEnum.CASH) {
    return (
      <PrintCashDocument
        transaction={transaction}
        variant={asCashVariant(variant || 'lined')}
      />
    );
  }

  if (transaction.journal === TrJournalEnum.INV_MOVE) {
    return (
      <PrintInvMoveDocument
        transaction={transaction}
        variant={asInvMoveVariant(variant || 'standard')}
      />
    );
  }

  if (transaction.journal === TrJournalEnum.INV_SALE) {
    return (
      <PrintInvSaleDocument
        transaction={transaction}
        variant={asInvSaleVariant(variant || 'numbered')}
      />
    );
  }

  if (transaction.journal === TrJournalEnum.INV_INCOME) {
    return (
      <PrintInvIncomeDocument
        transaction={transaction}
        variant={asInvIncomeVariant(variant || 'numbered')}
      />
    );
  }

  const Component = PRINT_DOCUMENTS[transaction.journal];
  if (!Component) {
    return <div className="p-10 text-red-500">Баримт олдсонгүй.</div>;
  }

  return <Component transaction={transaction} />;
};
