import { useEffect, useRef, useState } from 'react';
import { usePayment } from '../../hooks/use-payment';
import Loader from '../Loader';

const toImgSrc = (v?: string) => {
  if (!v) return '';
  if (v.startsWith('data:') || v.startsWith('http')) return v;
  return `data:image/png;base64,${v}`;
};

// Phones only — iPads, Android tablets and desktops return false
const isPhone = () => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;

  // Tablets: always treat like desktop
  if (/iPad|Tablet|Kindle|Silk/i.test(ua)) return false;
  // iPadOS reports itself as a Mac; with touch support it's an iPad
  if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) return false;

  // Chromium browsers say directly whether it's a phone (false on tablets)
  if ((navigator as any).userAgentData?.mobile === true) return true;

  // iPhone / iPod
  if (/iPhone|iPod/i.test(ua)) return true;
  // Android phones include "Mobile"; Android tablets don't
  if (/Android/i.test(ua) && /Mobile/i.test(ua)) return true;
  // Newer Huawei (HarmonyOS NEXT) phones
  if (/HarmonyOS|OpenHarmony/i.test(ua) && /Phone|Mobile/i.test(ua)) return true;

  return false;
};

const PocketForm = () => {
  const { transactionLoading, apiResponse } = usePayment();
  const { qrData, deeplink } = apiResponse || {};
  const [showQr, setShowQr] = useState(false);
  const autoOpenedRef = useRef(false);

  const usePhoneFlow = !!deeplink && isPhone();

  // Phones: open the Pocket app automatically, once
  useEffect(() => {
    if (usePhoneFlow && !autoOpenedRef.current) {
      autoOpenedRef.current = true;
      window.location.href = deeplink;
    }
  }, [usePhoneFlow, deeplink]);

  if (transactionLoading) {
    return (
      <div className="p-4 flex justify-center">
        <Loader />
      </div>
    );
  }

  // Desktop, iPad, tablets, or no deeplink: QR only
  if (!usePhoneFlow) {
    return (
      <div className="p-4 flex justify-center">
        {qrData && (
          <img src={toImgSrc(qrData)} alt="qr code" height={256} width={256} />
        )}
      </div>
    );
  }

  // Phone, QR chosen
  if (showQr) {
    return (
      <div className="p-4 flex flex-col items-center gap-4">
        {qrData && (
          <img src={toImgSrc(qrData)} alt="qr code" height={256} width={256} />
        )}
        <button
          type="button"
          onClick={() => setShowQr(false)}
          className="text-sm text-neutral-500 underline"
        >
          ← Буцах
        </button>
      </div>
    );
  }

  // Phone fallback (if the app didn't open, or the user came back)
  return (
    <div className="p-4 flex flex-col gap-3">
      <a
        href={deeplink}
        className="block w-full text-center rounded-md bg-red-600 text-white font-medium py-3"
      >
        Pocket апп-аар төлөх
      </a>
      <button
        type="button"
        onClick={() => setShowQr(true)}
        className="block w-full text-center rounded-md border border-neutral-300 font-medium py-3"
      >
        QR кодоор төлөх
      </button>
    </div>
  );
};

export default PocketForm;