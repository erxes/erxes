import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { INVOICE_EDIT } from '~/modules/payment/graphql/mutations';
import { IInvoice } from '~/modules/payment/types/Payment';

export interface IInvoiceEditInput {
  description?: string;
  amount?: number;
  currency?: string;
  status?: string;
}

interface IInvoiceEditResult {
  invoiceEdit?: Pick<
    IInvoice,
    '_id' | 'amount' | 'currency' | 'description' | 'status'
  >;
}

interface IInvoiceEditVariables {
  _id: string;
  input: IInvoiceEditInput;
}

export const useInvoiceEdit = () => {
  const { t } = useTranslation('payment');

  const [invoiceEdit, { loading }] = useMutation<
    IInvoiceEditResult,
    IInvoiceEditVariables
  >(INVOICE_EDIT);

  const editInvoice = (_id: string, input: IInvoiceEditInput) =>
    invoiceEdit({
      variables: { _id, input },
      onCompleted: () =>
        toast({
          title: t('success'),
          variant: 'success',
        }),
      onError: (error) =>
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        }),
    });

  return { editInvoice, loading };
};
