import { ITransaction } from "~/modules/transactions/types/Transaction";
import { PRINT_DOCUMENTS } from "../../contants/printDocuments";

export const PrintBody = ({ transaction }: { transaction: ITransaction }) => {
  const Component = PRINT_DOCUMENTS[transaction.journal];
  if (!Component) {
    return (
      <div className="p-10 text-red-500">Баримт олдсонгүй.</div>
    );
  }

  return <Component transaction={transaction} />
}