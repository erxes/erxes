import React from 'react';
import Modal from 'react-modal';

const PaymentModal = ({ isOpen, onClose, payment }) => {
  console.log('selected payment', payment);
  if (!payment) {
    return null;
  }
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Payment Modal"
    >
      <div className={`modal-content ${payment.kind}-modal`}>
        <div className="modal-header">
          <button
            className="close"
            type="button"
            data-dismiss="modal"
            aria-hidden="true"
          >
            ×
          </button>
          <h4
            className="modal-title"
            id="paymentKind"
            style={{
              color: 'white',
              textShadow: '2px 2px 2px rgba(0, 0, 0, 0.5)',
            }}
          >
            {payment.kind}
          </h4>
        </div>
        <div className="modal-body">
          <button onClick={onClose}>Close Modal</button>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentModal;
