import { useMutation } from '@apollo/client';
import { INVOICE_CREATE } from '~/modules/payment/graphql/mutations';

export const useInvoiceCreate = () => {
  const [invoiceCreate, { loading }] = useMutation(INVOICE_CREATE, {
    refetchQueries: ['Invoices', 'paymentsTotalCount'],
  });

  return { invoiceCreate, loading };
};
