import React from 'react';
import Modal from 'react-modal';
import Spinner from '../common/Spinner';
import PhoneInput from '../common/PhoneInput';

const capitalizeFirstLetter = (str) => {
  return `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
};

type Props = {
  isOpen: boolean;
  kind: string;
  transactionLoading?: boolean;
  transaction?: any;
  paymentId: string;
  onClose: () => void;
  checkInvoiceHandler: (id: string) => void;
  requestNewTransaction: (paymentId: string, details?: any) => void;
};

const PaymentModal = (props: Props) => {
  const { isOpen, onClose, transaction } = props;
  const [phone, setPhone] = React.useState('');

  let { kind = 'default' } = props;
  const apiResponse = transaction && transaction.response;

  if (kind.includes('qpay')) {
    kind = 'qpay';
  }

  console.log('yeaah');

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
        <p style={{ color: 'black' }}>Loading, please wait...</p>
      </div>
    );
  };

  const renderPhoneInput = () => {
    if (!['socialpay', 'storepay'].includes(kind)) {
      return null;
    }

    return (
      <PhoneInput
        value={phone}
        onChange={(e) => {
          setPhone(e.target.value);
        }}
        onSend={() => {
          props.requestNewTransaction(props.paymentId, { phone });
        }}
      />
    );
  };

  const renderQrCode = () => {
    if (!transaction || !apiResponse || !apiResponse.qrData) {
      return null;
    }

    return (
      <img
        className="qr"
        src={apiResponse.qrData}
        alt="qr code"
        id="qr-code"
        style={{ display: 'block', margin: 'auto', borderRadius: '8px' }}
      />
    );
  };

  const renderMessage = () => {
    if (!transaction || !apiResponse || !apiResponse.message) {
      return null;
    }

    return (
      <p
        id="message"
        style={{
          textAlign: 'center',
          color: 'white',
          textShadow: '2px 2px 2px rgba(0, 0, 0, 0.5)',
        }}
      >
        {apiResponse.message}
      </p>
    );
  };

  const renderCheckButton = () => {
    if (!transaction) {
      return null;
    }

    return (
      <button
        className="btn btn-primary"
        id="checkButton"
        type="button"
        onClick={() => props.checkInvoiceHandler(transaction._id)}
        style={{
          display: 'block',
          margin: 'auto',
          backgroundColor: 'white',
          color: 'black',
        }}
      >
        Manual check
      </button>
    );
  };

  const renderMinupay = () => {
    if (!transaction) {
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
        <iframe
          src={apiResponse}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            borderRadius: '8px',
          }}
        />
      </div>
    );
  };

  const renderContent = () => {
    // if (!transaction) {
    //   return null;
    // }

    if (kind === 'minupay') {
      return renderMinupay();
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
          {renderQrCode()}
          {renderMessage()}
          <br />
          {renderPhoneInput()}
          <br />
          <h2 id="amount">{transaction && transaction.amount} ₮</h2>

          {renderCheckButton()}
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
      {props.transactionLoading ? renderLoading() : renderContent()}
    </Modal>
  );
};

export default PaymentModal;
