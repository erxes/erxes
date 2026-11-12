import { useEffect, useRef, useState } from 'react';
import { usePayment } from '../../hooks/use-payment';
import Loader from '../Loader';

type NavigatorWithUAData = Navigator & {
  userAgentData?: { mobile?: boolean };
};

const POCKET_DEEPLINK_PREFIX = 'pckt://payment?qr=';

const toImgSrc = (v?: string) => {
  if (!v) return '';
  if (v.startsWith('data:') || v.startsWith('http')) return v;
  return `data:image/png;base64,${v}`;
};

// Only allow a genuine Pocket payment link; anything else is ignored
const getSafeDeeplink = (link?: unknown) => {
  if (typeof link !== 'string' || !link.startsWith(POCKET_DEEPLINK_PREFIX)) {
    return undefined;
  }
  const qr = link.slice(POCKET_DEEPLINK_PREFIX.length);
  if (!/^[A-Za-z0-9+/=]+$/.test(qr)) return undefined;
  return `${POCKET_DEEPLINK_PREFIX}${qr}`;
};

// Phones only — iPads, Android tablets and desktops return false
const isPhone = () => {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as NavigatorWithUAData;
  const ua = nav.userAgent;

  if (/iPad|Tablet|Kindle|Silk/i.test(ua)) return false;
  if (/Macintosh/.test(ua) && nav.maxTouchPoints > 1) return false;

  if (nav.userAgentData?.mobile === true) return true;
  if (/iPhone|iPod/i.test(ua)) return true;
  if (/Android/i.test(ua) && /Mobile/i.test(ua)) return true;
  if (/HarmonyOS|OpenHarmony/i.test(ua) && /Phone|Mobile/i.test(ua)) return true;

  return false;
};

const QrImage = ({ qrData }: { qrData: string }) => (
  <img src={toImgSrc(qrData)} alt="qr code" height={256} width={256} />
);

const PocketForm = () => {
  const { transactionLoading, apiResponse } = usePayment();
  const qrData: string | undefined = apiResponse?.qrData || undefined;
  const deeplink = getSafeDeeplink(apiResponse?.deeplink);
  const [showQr, setShowQr] = useState(false);
  const openedDeeplinkRef = useRef<string | null>(null);

  const usePhoneFlow = !!deeplink && isPhone();

  // Phones: open the Pocket app automatically, once per deeplink
  useEffect(() => {
    if (
      !transactionLoading &&
      usePhoneFlow &&
      deeplink &&
      openedDeeplinkRef.current !== deeplink
    ) {
      openedDeeplinkRef.current = deeplink;
      window.location.href = deeplink;
    }
  }, [transactionLoading, usePhoneFlow, deeplink]);

  if (transactionLoading) {
    return (
      <div className="p-4 flex justify-center">
        <Loader />
      </div>
    );
  }

  // Nothing usable came back
  if (!qrData && !usePhoneFlow) {
    return (
      <div className="p-4 text-center text-sm text-red-600">
        Could not create the Pocket payment. Please go back and try again.
      </div>
    );
  }

  // Desktop, iPad, tablets, or no deeplink: QR only
  if (!usePhoneFlow) {
    return (
      <div className="p-4 flex justify-center">
        {qrData && <QrImage qrData={qrData} />}
      </div>
    );
  }

  // Phone, QR chosen
  if (showQr && qrData) {
    return (
      <div className="p-4 flex flex-col items-center gap-4">
        <QrImage qrData={qrData} />
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
      {qrData && (
        <button
          type="button"
          onClick={() => setShowQr(true)}
          className="block w-full text-center rounded-md border border-neutral-300 font-medium py-3"
        >
          QR кодоор төлөх
        </button>
      )}
    </div>
  );
};

export default PocketForm;