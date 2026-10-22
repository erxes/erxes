import { z } from 'zod';

interface FacebookLoginResponse {
  authResponse?: { code?: string } | null;
}

export interface FacebookSdk {
  init: (options: {
    appId: string;
    version: string;
    xfbml?: boolean;
    autoLogAppEvents?: boolean;
  }) => void;
  login: (
    callback: (response: FacebookLoginResponse) => void,
    options: Record<string, unknown>,
  ) => void;
}

type SdkWindow = Window & {
  FB?: FacebookSdk;
  fbAsyncInit?: () => void;
};

const SDK_ID = 'facebook-jssdk';
const SDK_TIMEOUT_MS = 15_000;

// The Facebook SDK attaches itself to window; this is the only typed entry point.
const sdkWindow = () => window as SdkWindow;

/** Loads and initialises the Facebook JS SDK once per page for the given app. */
export const loadFacebookSdk = (
  appId: string,
  version: string,
): Promise<FacebookSdk> => {
  const init = (sdk: FacebookSdk) => {
    sdk.init({ appId, version, xfbml: false, autoLogAppEvents: true });
    return sdk;
  };

  const existing = sdkWindow().FB;

  if (existing) return Promise.resolve(init(existing));

  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(
      () => reject(new Error('Facebook SDK load timed out')),
      SDK_TIMEOUT_MS,
    );
    const previousInit = sdkWindow().fbAsyncInit;

    sdkWindow().fbAsyncInit = () => {
      previousInit?.();
      const sdk = sdkWindow().FB;

      window.clearTimeout(timeout);

      if (sdk) resolve(init(sdk));
      else reject(new Error('Facebook SDK did not initialise'));
    };

    if (document.getElementById(SDK_ID)) return;

    const script = document.createElement('script');
    script.id = SDK_ID;
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    script.onerror = () => {
      window.clearTimeout(timeout);
      script.remove();
      reject(new Error('Facebook SDK failed to load'));
    };
    document.head.appendChild(script);
  });
};

/** FB.login options for WhatsApp Embedded Signup with a server-exchanged code. */
export const embeddedSignupLoginOptions = (configId: string) => ({
  config_id: configId,
  response_type: 'code',
  override_default_response_type: true,
  // sessionInfoVersion makes Meta post the WA_EMBEDDED_SIGNUP FINISH message
  // that carries the WABA and phone number ids.
  extras: { setup: {}, sessionInfoVersion: '3' },
});

export type EmbeddedSignupEvent =
  | {
      kind: 'finish';
      wabaId: string;
      phoneNumberId: string;
      businessId?: string;
    }
  | { kind: 'only-waba' }
  | { kind: 'business-app' }
  | {
      kind: 'cancel';
      errorMessage?: string;
      errorCode?: string;
      sessionId?: string;
    };

const idSchema = z.union([z.string(), z.number()]).transform(String);

const messageSchema = z.object({
  type: z.literal('WA_EMBEDDED_SIGNUP'),
  event: z.string(),
  data: z
    .object({
      waba_id: idSchema.optional(),
      phone_number_id: idSchema.optional(),
      business_id: idSchema.optional(),
      error_message: z.string().optional(),
      error_code: idSchema.optional(),
      session_id: z.string().optional(),
    })
    .passthrough()
    .optional(),
});

export const isFacebookOrigin = (origin: string): boolean => {
  try {
    const { protocol, hostname } = new URL(origin);

    return (
      protocol === 'https:' &&
      (hostname === 'facebook.com' || hostname.endsWith('.facebook.com'))
    );
  } catch {
    return false;
  }
};

/** Parses a window message from Meta's Embedded Signup popup; null when unrelated. */
export const parseEmbeddedSignupMessage = (
  origin: string,
  raw: unknown,
): EmbeddedSignupEvent | null => {
  if (!isFacebookOrigin(origin)) return null;

  let value = raw;

  if (typeof raw === 'string') {
    try {
      value = JSON.parse(raw);
    } catch {
      return null;
    }
  }

  const parsed = messageSchema.safeParse(value);

  if (!parsed.success) return null;

  const { event, data } = parsed.data;

  switch (event.toUpperCase()) {
    case 'FINISH':
      return data?.waba_id && data.phone_number_id
        ? {
            kind: 'finish',
            wabaId: data.waba_id,
            phoneNumberId: data.phone_number_id,
            businessId: data.business_id,
          }
        : { kind: 'only-waba' };
    case 'FINISH_ONLY_WABA':
      return { kind: 'only-waba' };
    case 'FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING':
      return { kind: 'business-app' };
    case 'CANCEL':
    case 'ERROR':
      return {
        kind: 'cancel',
        errorMessage: data?.error_message,
        errorCode: data?.error_code,
        sessionId: data?.session_id,
      };
    default:
      return null;
  }
};
