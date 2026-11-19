import { useEffect, useRef } from 'react';
import { usePayment } from '../../hooks/use-payment';
import Loader from '../Loader';

type TokiBridgeWindow = Window & {
  JSReceiver?: {
    buyfromShoppy?: (
      merchantId: string,
      amount: string,
      orderId: string,
      description: string,
      callbackUrl: string,
    ) => void;
  };
  webkit?: {
    messageHandlers?: {
      buyfromShoppy?: { postMessage: (message: string) => void };
    };
  };
  afterPurchase?: (...args: unknown[]) => void;
};

type MiniProgramData = {
  merchantId: string;
  amount: number;
  orderId: string;
  description: string;
  callbackUrl: string;
};

// The Toki app injects its bridge into the page that it opened. The widget may
// run inside an iframe of that page, so also look at the parent windows.
const getTokiWindow = (): TokiBridgeWindow | undefined => {
  const candidates: (Window | null)[] = [window];
  try {
    candidates.push(window.parent, window.top);
  } catch {
    // cross-origin parent: only the current window is usable
  }

  for (const w of candidates) {
    try {
      const tw = w as TokiBridgeWindow | null;
      if (
        tw?.JSReceiver?.buyfromShoppy ||
        tw?.webkit?.messageHandlers?.buyfromShoppy
      ) {
        return tw;
      }
    } catch {
      // cross-origin access throws; skip it
    }
  }
  return undefined;
};

// Per Toki mini-program doc: Android uses JSReceiver, iOS uses webkit handlers
const callTokiBuy = (tw: TokiBridgeWindow, data: MiniProgramData) => {
  const { merchantId, amount, orderId, description, callbackUrl } = data;

  if (tw.JSReceiver?.buyfromShoppy) {
    tw.JSReceiver.buyfromShoppy(
      merchantId,
      `${amount}`,
      orderId,
      description,
      callbackUrl,
    );
    return;
  }

  tw.webkit?.messageHandlers?.buyfromShoppy?.postMessage(
    JSON.stringify({ merchantId, amount, orderId, description, callbackUrl }),
  );
};

const toImgSrc = (v?: string) => {
  if (!v) return '';
  if (v.startsWith('data:') || v.startsWith('http')) return v;
  return `data:image/png;base64,${v}`;
};

const MiniProgram = ({ data }: { data: MiniProgramData }) => {
  const { invoiceDetail, checkInvoiceHandler } = usePayment();
  const startedRef = useRef<string | null>(null);
  const tokiWindow = getTokiWindow();

  const startPayment = () => {
    if (!tokiWindow) return;

    // Toki calls this once the payment is done in the app
    tokiWindow.afterPurchase = () => {
      checkInvoiceHandler(invoiceDetail._id);
    };

    callTokiBuy(tokiWindow, data);
  };

  // Open Toki's payment screen automatically, once per order
  useEffect(() => {
    if (tokiWindow && startedRef.current !== data.orderId) {
      startedRef.current = data.orderId;
      startPayment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.orderId, !!tokiWindow]);

  return (
    <div className="p-4 flex flex-col gap-3">
      <button
        type="button"
        onClick={startPayment}
        className="block w-full text-center rounded-md bg-yellow-400 text-black font-medium py-3"
      >
        Toki-оор төлөх
      </button>
      <p className="text-center text-xs text-neutral-500">
        Төлбөр төлсний дараа “Check Payment” дарна уу.
      </p>
    </div>
  );
};

const TokiForm = () => {
  const { transactionLoading, apiResponse, paymentId, requestNewTransaction } =
    usePayment();

  if (transactionLoading) {
    return (
      <div className="p-4 flex justify-center">
        <Loader />
      </div>
    );
  }

  const miniProgram: MiniProgramData | undefined = apiResponse?.miniProgram;
  const qrData: string | undefined = apiResponse?.qrData;
  const qrError: string | undefined = apiResponse?.qrError || apiResponse?.error;

  // Opened inside the Toki app: pay through Toki's own screen, no QR
  if (miniProgram && getTokiWindow()) {
    return <MiniProgram data={miniProgram} />;
  }

  // Anywhere else: QR, if this payment method has QR credentials
  if (qrData) {
    return (
      <div className="p-4 flex justify-center">
        <img src={toImgSrc(qrData)} alt="Toki QR" height={256} width={256} />
      </div>
    );
  }

  return (
    <div className="p-4 text-center text-sm text-neutral-600">
      Toki-оор төлөх боломжтой зөвхөн Toki апп доторх дэлгүүрээс. Toki аппаа
      нээж, дэлгүүрээс дахин оролдоно уу.
      {qrError && (
        <>
          <p className="mt-2 text-xs text-red-600">QR: {String(qrError)}</p>
          <button
            type="button"
            onClick={() => requestNewTransaction(paymentId)}
            className="mt-3 rounded-md border px-4 py-2 text-xs font-medium"
          >
            Дахин оролдох
          </button>
        </>
      )}
    </div>
  );
};

export default TokiForm;