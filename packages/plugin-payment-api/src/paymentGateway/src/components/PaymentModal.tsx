import React from 'react';
import Modal from 'react-modal';
import Spinner from '../common/Spinner';

const capitalizeFirstLetter = (str) => {
  return `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  checkInvoiceHandler: (id: string) => void;
  invoice: any;
  loading?: boolean;
};

const PaymentModal = (props: Props) => {
  const { isOpen, onClose, invoice } = props;

  let kind = (invoice && invoice.payment && invoice.payment.kind) || 'default';
  const apiResponse = invoice && invoice.apiResponse;
  if (kind.includes('qpay')) {
    kind = 'qpay';
  }

  const renderLoading = () => {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '200',
          width: '200',
        }}
      >
        <Spinner />
        <p style={{color:"black"}}>Loading, please wait...</p>
      </div>
    );
  };

  const renderContent = () => {
    if (!invoice) {
      return null;
    }

    return (
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
          {props.loading && <Spinner />}
          <img
            className="qr"
            src={apiResponse.qrData}
            alt="qr code"
            id="qr-code"
            style={{ display: 'block', margin: 'auto', borderRadius: '8px' }}
          />

          <br />
          <h2 id="amount">{invoice.amount} ₮</h2>

          <button
            className="btn btn-primary"
            id="checkButton"
            type="button"
            onClick={() => props.checkInvoiceHandler(invoice._id)}
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
    );
  };

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
      {props.loading ? renderLoading() : renderContent()}
    </Modal>
  );
};

export default PaymentModal;
