import React from 'react';
import { usePayment } from './Payments';
import ModalHeader from './ModalHeader';
import CloseButton from './CloseButton';

const Golomt = () => {
  const { transaction, apiResponse } = usePayment();
  if (!transaction) {
    return null;
  }

  return (
    <div className="aspect-square">
      <ModalHeader />
      <iframe
        src={`https://ecommerce.golomtbank.com/payment/mn/${apiResponse.invoice}`}
        className="w-full h-full border-none rounded-lg mb-2"
      />
      <CloseButton />
    </div>
  );
};

export default Golomt;
