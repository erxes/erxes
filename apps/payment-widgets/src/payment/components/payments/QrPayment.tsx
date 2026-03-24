import { useEffect } from 'react';
import { useIsMobile } from '../../hooks/use-mobile';
import { usePayment } from '../../hooks/use-payment';
import { cn, getShortName } from '../../lib/utils';
import Loader from '../Loader';

const QrPayment = () => {
  const isMobile = useIsMobile();

  const {
    kind,
    transactionLoading,
    apiResponse,
    requestNewTransaction,
    paymentId,
  } = usePayment();

  // ✅ Correct usage with param
  useEffect(() => {
    if (paymentId) {
      console.log('👉 QrPayment paymentId:', paymentId);
      requestNewTransaction(paymentId);
    }
  }, [paymentId]);

  if (kind === 'storepay') return null;

  const { urls = [], qrData } = apiResponse || {};

  return (
    <div className="p-4">
      <div
        className={cn(
          `relative aspect-square mx-auto max-w-80`,
          isMobile ? 'max-w-full' : 'max-w-80',
        )}
      >
        <div className="border rounded-xl absolute inset-0" />

        <div className="w-full h-full bg-white rounded-3xl absolute inset-0 flex items-center justify-center">
          {transactionLoading ? (
            <Loader />
          ) : isMobile ? (
            <div className="pt-4 grid grid-cols-3 gap-4 md:hidden max-h-[256px] overflow-y-auto">
              {urls.map((url: any) => (
                <a
                  href={url.link}
                  key={url.link}
                  className="text-xs flex flex-col gap-1 items-center justify-center px-2 py-3 shadow border border-border/10 h-auto rounded-md"
                >
                  <img
                    src={url.logo}
                    className="h-12 w-12 block rounded-md object-contain"
                    alt=""
                  />
                  <span className="h-4 overflow-hidden mt-1 text-neutral-600">
                    {getShortName(url.name)}
                  </span>
                </a>
              ))}
            </div>
          ) : qrData ? (
            <img src={qrData} alt="qr code" width={256} height={256} />
          ) : (
            <div>No QR data</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QrPayment;
