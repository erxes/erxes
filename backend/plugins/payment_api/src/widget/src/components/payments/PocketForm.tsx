import { useIsMobile } from '../../hooks/use-mobile';
import { usePayment } from '../../hooks/use-payment';
import Loader from '../Loader';

const toImgSrc = (v?: string) => {
  if (!v) return '';
  if (v.startsWith('data:') || v.startsWith('http')) return v;
  return `data:image/png;base64,${v}`;
};

const PocketForm = () => {
  const isMobile = useIsMobile();
  const { transactionLoading, apiResponse } = usePayment();
  const { qrData, deeplink } = apiResponse || {};

  if (transactionLoading) {
    return (
      <div className="p-4 flex justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col items-center gap-4">
      {qrData && (
        <img src={toImgSrc(qrData)} alt="qr code" height={256} width={256} />
      )}

      {deeplink && isMobile && (
        <a
          href={deeplink}
          className="block w-full text-center rounded-md bg-red-600 text-white font-medium py-3"
        >
          Pocket апп-аар төлөх
        </a>
      )}
    </div>
  );
};

export default PocketForm;