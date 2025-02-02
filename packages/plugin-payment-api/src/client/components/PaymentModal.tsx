import React from 'react';
import Modal from 'react-modal';
import { usePayment } from './Payments';
import Minupay from './Minupay';
import QrPayment from './QrPayment';
import PhonePayment from './phonepayment';
import GolomtForm from './GolomtForm';
import StripePayment from './Stripe';
import Khanbank from './KhanbankForm';

const PaymentModal = () => {
  const { isOpen, onClose, kind = 'default' } = usePayment();

  const renderContent = () => {
    switch (kind) {
      case 'minupay':
        return <Minupay />;
      case 'golomt':
        return <GolomtForm />;
      case 'stripe':
        return <StripePayment />;
      case 'khanbank':
        return <Khanbank />;
      default:
        return (
          <>
            <QrPayment />
            <PhonePayment />
          </>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      overlayClassName='bg-black/30 fixed inset-0 animate-in fade-in'
      className='max-w-lg fixed bottom-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 bg-white w-full p-4 md:p-6  animate-in slide-in-from-bottom-8 md:zoom-in rounded-t-2xl md:rounded-b-2xl max-h-[85vh] md:max-h-auto block overflow-y-auto'
    >
      {renderContent()}
    </Modal>
  );
};

export default PaymentModal;
