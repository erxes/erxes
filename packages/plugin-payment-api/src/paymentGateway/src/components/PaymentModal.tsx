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

  onClose: () => void;
  checkInvoiceHandler: (id: string) => void;
};

const PaymentModal = (props: Props) => {
  const { isOpen, onClose, transaction } = props;
  const [phone, setPhone] = React.useState('');

  let { kind = 'default' } = props;
  const apiResponse = transaction && transaction.response;

  if (kind.includes('qpay')) {
    kind = 'qpay';
  }

  console.log('yeaah')

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

  const renderContent = () => {
    if (!transaction) {
      return null;
    }

    if (kind === 'minupay') {
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
          <img
            className="qr"
            src={apiResponse.qrData}
            alt="qr code"
            id="qr-code"
            style={{ display: 'block', margin: 'auto', borderRadius: '8px' }}
          />

          <br />
          {['socialpay', 'storepay'].includes(kind) && (
            <PhoneInput
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
              }}
              onSend={() => {
                console.log('send');
              }}
            />
          )}
          <br />
          <h2 id="amount">{transaction.amount} ₮</h2>

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
