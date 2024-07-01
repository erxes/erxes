import React from 'react';
import { usePayment } from './Payments';
import { Button } from '../common/button';
import { LoaderIcon } from '../common/Loader';

const CheckPayment = () => {
  const { transaction, invoiceDetail,checkInvoiceHandler, checkInvoiceLoading } =
    usePayment();

  if (!transaction) return null;

  return (
    <Button
      className="w-full mb-2"
      onClick={() => checkInvoiceHandler(invoiceDetail._id)}
      disabled={checkInvoiceLoading}
    >
      {checkInvoiceLoading && <LoaderIcon className="mr-2" />}
      Check Payment
    </Button>
  );
};

export default CheckPayment;
