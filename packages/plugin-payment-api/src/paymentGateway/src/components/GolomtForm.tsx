import React from 'react';
import { usePayment } from './Payments';
import ModalHeader from './ModalHeader';
import CloseButton from './CloseButton';

const Golomt = () => {
  const { transaction, apiResponse } = usePayment();
  if (!transaction) {
    return null;
  }
  //   https://ecommerce.golomtbank.com/payment/mn/645a6b74-c951-4ff8-8057-c8694389b844
  return (
    <div className=" inset-0">
      <ModalHeader />
      <iframe
        src={`https://ecommerce.golomtbank.com/payment/mn/${apiResponse.invoice}`}
        className="w-full h-full border-none rounded-lg"
      />
      <CloseButton />
    </div>
  );
};

export default Golomt;
