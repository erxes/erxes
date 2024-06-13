import React from 'react';
import { usePayment } from './Payments';
import Loader from '../common/Loader';
import { Button, getBtnClass } from '../common/button';
import CheckPayment from './checkPayment';
import Alert from '../common/alert';
import CloseButton from './CloseButton';

const QrPayment = () => {
  const { kind, transactionLoading, apiResponse } = usePayment();

  if (kind === 'storepay') return null;

  const { urls, message, qrData, error } = apiResponse || {};

  return (
    <>
      <div className="p-4">
        <div className="relative aspect-square mx-auto max-w-80">
          <div className="border rounded-xl absolute inset-0" />
          <div className="w-full h-full bg-white rounded-3xl absolute inset-0 flex items-center justify-center">
            {transactionLoading ? (
              <Loader />
            ) : (
              <img src={qrData} alt="qr code" height={256} width={256} />
            )}
          </div>
        </div>
      </div>
      <Alert>
        {error || message || (
          <>
            Note that your order is activated after payment! You can pay by
            scanning the QR code using your banking app.
            <br /> Төлбөр төлөгдсөний дараа таны захиалга идэвхэждэг болохыг
            анхаараарай! Та өөрийн банкны аппликейшныг ашиглан QR кодыг уншуулж
            төлбөр төлөх
          </>
        )}
      </Alert>
      {urls?.length && (
        <div className="pt-4 grid grid-cols-3 gap-4 md:hidden">
          {urls.map(url => (
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
        <CheckPayment />
        <CloseButton />
      </div>
    </>
  );
};

const getName = (name: string) => {
  if (name === 'Trade and Development bank') return 'TDB';
  if (name === 'National investment bank') return 'NIB';
  if (name === 'Chinggis khaan bank') return 'CKHB';
  return name;
};

export default QrPayment;
