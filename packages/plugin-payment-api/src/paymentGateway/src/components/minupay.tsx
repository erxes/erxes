import React from 'react';
import { usePayment } from './Payments';
import ModalHeader from './ModalHeader';
import CloseButton from './CloseButton';

const Minupay = () => {
  const { transaction, apiResponse } = usePayment();
  if (!transaction) {
    return null;
  }

  return (
    <div className="aspect-square">
      <ModalHeader />
      <iframe
        src={apiResponse}
        className="w-full h-full border-none rounded-lg mb-2"
      />
      <CloseButton />
    </div>
  );
};

export default Minupay;
