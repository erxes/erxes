import React from 'react';
import Modal from 'react-modal';

const capitalizeFirstLetter = (str) => {
  return `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
};

const PaymentModal = ({ isOpen, onClose, invoice }) => {
  if (!invoice) {
    return null;
  }

  let kind = (invoice && invoice.payment && invoice.payment.kind) || '';
  const apiResponse = invoice && invoice.apiResponse;
  if (kind.includes('qpay')) {
    kind = 'qpay';
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Payment Modal"
      style={{
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
          border: 'none',
          borderRadius: '8px',
          padding: '0',
        },
      }}
    >
      <div
        className={`modal-content ${kind}-modal`}
        style={{ borderColor: 'red', borderWidth: '1px' }}
      >
        <div className="modal-header">
          <button
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              padding: '10px',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '20px',
            }}
            onClick={onClose}
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
            {kind && capitalizeFirstLetter(kind)}
          </h4>
        </div>
        <div className="modal-body">
          <img
            className="qr"
            src={apiResponse.qrData}
            alt="qr code"
            id="qr-code"
            style={{ display: 'block', margin: 'auto', borderRadius: '8px' }}
          />

          <h3 id="apiResponse"></h3>
          <br />
          <h2 id="amount">{invoice.amount} ₮</h2>

          <button
            className="btn btn-primary"
            id="checkButton"
            type="button"
            style={{
              display: 'block',
              margin: 'auto',
              backgroundColor: 'white',
              color: 'black',
            }}
          >
            Manual check
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentModal;
