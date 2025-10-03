import { useIsMobile } from '../../hooks/use-mobile';
import { usePayment } from '../../hooks/use-payment';
import { cn, getShortName } from '../../lib/utils';
import Loader from '../Loader';

const QrPayment = () => {
  const isMobile = useIsMobile();
  const { kind, transactionLoading, apiResponse } = usePayment();
  if (kind === 'storepay') return null;

  const { urls = [], qrData } = apiResponse || {};

  return (
    <>
      <div className="p-4">
        <div className={cn(`relative aspect-square mx-auto max-w-80`, isMobile ? 'max-w-full' : 'max-w-80')}>
          <div className="border rounded-xl absolute inset-0" />
          <div className="w-full h-full bg-white rounded-3xl absolute inset-0 flex items-center justify-center">
            {transactionLoading ? (
              <Loader />
            ) : isMobile ? (
              <div className="pt-4 grid grid-cols-3 gap-4 md:hidden max-h-[256px] overflow-y-auto">
                {urls.map((url) => (
                  <a
                    href={url.link}
                    key={url.link}
                    className={cn({
                      variant: 'ghost',
                      size: 'sm',
                      className:
                        'text-xs flex flex-col gap-1 items-center justify-center px-2 py-3 shadow border border-border/10 h-auto rounded-md',
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
                      {getShortName(url.name)}
                    </span>
                  </a>
                ))}
              </div>
            ) : (
              <img src={qrData} alt="qr code" height={256} width={256} />
            )}
          </div>
        </div>
      </div>

  
    </>
  );
};

export default QrPayment;
