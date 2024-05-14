import React from 'react';
import { Button } from '../common/button';
import { usePayment } from './Payments';

const CloseButton = () => {
  const { onClose } = usePayment();

  return (
    <Button className="w-full" variant="outline" onClick={onClose}>
      Go back
    </Button>
  );
};

export default CloseButton;
