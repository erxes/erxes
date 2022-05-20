import React from 'react';
import Modal from 'react-bootstrap/Modal';

import PaymentType from '../drawer/PaymentType';

type Props = {
  currentTab: string;
  onStateChange: (key: string, value: any) => void;
};

export default function PaymentTypeChooser({
  currentTab,
  onStateChange
}: Props) {
  const toggle = (type: string) => {
    onStateChange('currentTab', type);
  };

  return (
    <Modal show={currentTab === 'empty'}>
      <Modal.Body>
        <PaymentType color="" togglePaymentType={toggle} />
      </Modal.Body>
    </Modal>
  );
}
