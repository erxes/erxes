import React from 'react';
import Modal from 'react-modal';
import PhoneInput from '../common/PhoneInput';
import { Button, getBtnClass } from '../common/button';
import PhoneNumber from '../common/phonenumber';
import { Link } from 'react-router-dom';
import Loader from '../common/Loader';

const capitalizeFirstLetter = str => {
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
  apiDomain: string;
};

const PaymentModal = (props: Props) => {
  const { isOpen, onClose, transaction } = props;
  const [phone, setPhone] = React.useState('');

  let {
    kind = 'default',
    requestNewTransaction,
    paymentId,
    transactionLoading,
    checkInvoiceHandler,
    apiDomain
  } = props;

  const apiResponse = transaction && transaction.response;

  if (kind.includes('qpay')) {
    kind = 'qpay';
  }

  const renderLoading = () => {
    return (
      <div className="absolute inset-0 flex justify-center items-center">
        <Loader />
      </div>
    );
  };

  const renderPhoneInput = () => {
    if (kind !== 'storepay') return null;

    return (
      <form
        onSubmit={e => {
          e.preventDefault();
          requestNewTransaction(paymentId, { phone });
        }}
      >
        <div className="py-12 text-center">
          <div className="inline-flex text-left flex-col gap-1">
            <label htmlFor="phone" className="text-sm inline-block ">
              Phone Number
            </label>
            <PhoneNumber id={'phone'} handleOutputString={setPhone} />
          </div>
        </div>
        <div
          role="alert"
          className="relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg~*]:pl-7 border-yellow-100 text-amber-500 [&>svg]:text-amber-500 bg-yellow-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            className="lucide lucide-info h-4 w-4"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 16v-4"></path>
            <path d="M12 8h.01"></path>
          </svg>
          <div className="[&_p]:leading-relaxed text-xs">
            Та Storepay-д бүртгэлтэй утасны дугаараа оруулан хүсэлт илгээн
            үүссэн нэхэмжлэхийн дагуу худалдан авалтаа баталгаажуулснаар бараа
            бүтээгдэхүүн, үйлчилгээгээ авах боломжтой.
          </div>
        </div>
        <div className="sticky -bottom-4 bg-white -mx-4 px-4 pb-4 mt-4 -mb-4">
          <Button className="w-full mb-2" disabled={transactionLoading}>
            {transactionLoading && <Loader />}
            Send Request
          </Button>
          <Button className="w-full" variant="outline" onClick={onClose}>
            Go back
          </Button>
        </div>
      </form>
    );
  };

  const renderQrCode = () => {
    if (kind === 'storepay') return null;
    return (
      <>
        <div className="p-4">
          <div className="relative aspect-square mx-auto max-w-80">
            <div className="border rounded-xl absolute inset-0" />
            <div className="w-full h-full bg-white rounded-3xl absolute inset-0 flex items-center justify-center">
              {transactionLoading ? (
                renderLoading()
              ) : (
                <img
                  src={apiResponse?.qrData}
                  alt="qr code"
                  height={256}
                  width={256}
                />
              )}
            </div>
          </div>
        </div>
        <div
          role="alert"
          className="relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg~*]:pl-7 border-yellow-100 text-amber-500 [&>svg]:text-amber-500 bg-yellow-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            className="lucide lucide-info h-4 w-4"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 16v-4"></path>
            <path d="M12 8h.01"></path>
          </svg>
          <div className="[&_p]:leading-relaxed text-xs">
            Note that your order is activated after payment! You can pay by
            scanning the QR code using your banking app.
            <br /> Төлбөр төлөгдсөний дараа таны захиалга идэвхэждэг болохыг
            анхаараарай! Та өөрийн банкны аппликейшныг ашиглан QR кодыг уншуулж
            төлбөр төлөх боломжтой
          </div>
        </div>
        {!!apiResponse?.urls?.length && (
          <div className="pt-4 grid grid-cols-3 gap-4 md:hidden">
            {apiResponse.urls.map(url => (
              <a
                href={url.link}
                key={url.link}
                className={getBtnClass({
                  variant: 'ghost',
                  size: 'sm',
                  className:
                    'text-xs flex flex-col gap-1 items-center justify-center px-2 py-3 shadow border border-border/10 h-auto rounded-md'
                })}
              >
                <img
                  src={url.logo}
                  className="h-12 w-12 block rounded-md object-contain"
                  alt=""
                  height={164}
                  width={164}
                />
                <span className="h-4 overflow-hidden mt-1 text-neutral-600">
                  {getName(url.name)}
                </span>
              </a>
            ))}
          </div>
        )}
        <div className="sticky -bottom-4 bg-white -mx-4 px-4 pb-4 mt-4 -mb-4">
          {renderCheckButton()}
          <Button className="w-full" variant="outline" onClick={onClose}>
            Go back
          </Button>
        </div>
      </>
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
          textShadow: '2px 2px 2px rgba(0, 0, 0, 0.5)'
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
      <Button
        className="w-full mb-2"
        onClick={() => checkInvoiceHandler(transaction._id)}
      >
        Check Payment
      </Button>
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
              fontSize: '20px'
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
              textShadow: '2px 2px 2px rgba(0, 0, 0, 0.5)'
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
            borderRadius: '8px'
          }}
        />
      </div>
    );
  };

  const renderContent = () => {
    if (kind === 'minupay') {
      return renderMinupay();
    }

    return (
      <>
        {renderQrCode()}
        {renderMessage()}
        {renderPhoneInput()}
      </>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      overlayClassName="bg-black/30 fixed inset-0 animate-in fade-in"
      className="max-w-lg fixed bottom-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 bg-white w-full p-4 md:p-6  animate-in slide-in-from-bottom-8 md:zoom-in rounded-t-2xl md:rounded-b-2xl max-h-[85vh] md:max-h-auto block overflow-y-auto"
    >
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
            <div className="text-neutral-500 text-xs font-normal line-clamp-1">
              storepay - Baterdene
            </div>
          </div>
        </div>
        <div className="inline-flex items-center border text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 p-2 px-4 rounded-xl bg-yellow-100, border-amber-200 text-yellow-500">
          pending
        </div>
      </div>
      {renderContent()}
    </Modal>
  );
};

const getName = (name: string) => {
  if (name === 'Trade and Development bank') return 'TDB';
  if (name === 'National investment bank') return 'NIB';
  if (name === 'Chinggis khaan bank') return 'CKHB';
  return name;
};

export default PaymentModal;
