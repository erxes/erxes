import { ITransactionGroupForm } from '@/transactions/transaction-form/types/JournalForms';
import { FxaChangeTable } from '@/transactions/transaction-form/components/forms/FxaChangeTable';

export const FxaJustifyForm = ({
  form,
  index,
}: {
  form: ITransactionGroupForm;
  index: number;
}) => <FxaChangeTable form={form} index={index} capital={false} />;
