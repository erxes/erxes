import React from 'react';
import { Button } from '../common/button';
import { usePayment } from './Payments';

const ModalHeader = () => {
  const { onClose, apiDomain, kind } = usePayment();

  return (
    <>
      <Button
        variant={'secondary'}
        className="h-auto py-1 px-12 absolute top-3 left-1/2 -translate-x-1/2 md:hidden"
        onClick={onClose}
      />
      <div className="flex space-y-1.5 text-center sm:text-left flex-row gap-4 items-center justify-between my-2 md:mt-0">
        <div className="flex items-center gap-2">
          <img
            src={`${apiDomain}/pl:payment/static/images/payments/${kind}.png`}
            alt={''}
            height={48}
            width={48}
            className="flex-none p-1"
          />
          <div className="flex-1 text-left">
            <h5 className="font-medium capitalize">{kind}</h5>
          </div>
        </div>
        <div className="inline-flex items-center border text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 p-2 px-4 rounded-xl bg-yellow-100, border-amber-200 text-yellow-500">
          pending
        </div>
      </div>
    </>
  );
};

export default ModalHeader;
