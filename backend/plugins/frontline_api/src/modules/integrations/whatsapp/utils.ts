import fetch from 'node-fetch';

const GRAPH_VERSION = 'v21.0';

/** Meta Graph API error with the numeric `error.code` when the payload carried one. */
export class MetaGraphError extends Error {
  code?: number;

  constructor(message: string, code?: number) {
    super(message);
    this.name = 'MetaGraphError';
    this.code = code;
  }
}

/** Meta error code 100 — "Unsupported get request" for an edge/field this object does not expose. */
export const META_UNSUPPORTED_GET_CODE = 100;

export const isUnsupportedGetError = (error: unknown): boolean =>
  error instanceof MetaGraphError && error.code === META_UNSUPPORTED_GET_CODE;

interface ISendTextParams {
  accessToken: string;
  phoneNumberId: string;
  recipientPhone: string;
  text: string;
}

interface IGraphError {
  message?: string;
  code?: number;
}

const throwGraphError = (error: IGraphError | undefined, fallback: string) => {
  throw new MetaGraphError(error?.message || fallback, error?.code);
};

const graphPost = async <T>(
  path: string,
  accessToken: string,
  payload?: Record<string, unknown>,
  fallbackError = 'Meta API request failed',
): Promise<T> => {
  const response = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/${path}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: payload ? JSON.stringify(payload) : undefined,
    },
  );

  const body = (await response.json()) as T & { error?: IGraphError };

  if (!response.ok) {
    throwGraphError(body.error, fallbackError);
  }

  return body;
};

export const sendWhatsappText = async ({
  accessToken,
  phoneNumberId,
  recipientPhone,
  text,
}: ISendTextParams): Promise<{ messages?: Array<{ id?: string }> }> =>
  graphPost(
    `${phoneNumberId}/messages`,
    accessToken,
    {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipientPhone,
      type: 'text',
      text: {
        preview_url: false,
        body: text,
      },
    },
    'Failed to send WhatsApp message',
  );

export type WhatsappMediaType = 'image' | 'video' | 'audio' | 'document';

/** Maps an attachment mime type to a Cloud API media type; anything unknown sends as `document`. */
export const whatsappMediaTypeFromMime = (
  mimeType?: string,
): WhatsappMediaType => {
  const prefix = (mimeType || '').split('/')[0];

  if (prefix === 'image' || prefix === 'video' || prefix === 'audio') {
    return prefix;
  }

  return 'document';
};

interface ISendMediaParams {
  accessToken: string;
  phoneNumberId: string;
  recipientPhone: string;
  mediaType: WhatsappMediaType;
  url: string;
  caption?: string;
}

export const sendWhatsappMedia = async ({
  accessToken,
  phoneNumberId,
  recipientPhone,
  mediaType,
  url,
  caption,
}: ISendMediaParams): Promise<{ messages?: Array<{ id?: string }> }> => {
  const media: { link: string; caption?: string } = { link: url };

  if (caption) {
    media.caption = caption;
  }

  return graphPost(
    `${phoneNumberId}/messages`,
    accessToken,
    {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipientPhone,
      type: mediaType,
      [mediaType]: media,
    },
    'Failed to send WhatsApp media message',
  );
};

interface IGraphListResponse<T> {
  data?: T[];
  error?: IGraphError;
}

interface IMetaBusiness {
  id: string;
  name?: string;
}

interface IMetaWhatsappBusinessAccount {
  id: string;
  name?: string;
}

interface IMetaWhatsappPhoneNumber {
  id: string;
  display_phone_number?: string;
  verified_name?: string;
  status?: string;
  is_on_biz_app?: boolean;
}

export interface IWhatsappPhoneNumber {
  id: string;
  displayPhoneNumber?: string;
  verifiedName?: string;
  status?: string;
  isOnBizApp?: boolean;
}

export interface IWhatsappBusinessAccount {
  id: string;
  name: string;
  phoneNumbers: IWhatsappPhoneNumber[];
}

const graphGet = async <T>(path: string, accessToken: string): Promise<T> => {
  const response = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/${path}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  const body = (await response.json()) as T & { error?: IGraphError };

  if (!response.ok) {
    throwGraphError(body.error, 'Meta API request failed');
  }

  return body;
};

const graphDelete = async <T>(path: string, accessToken: string): Promise<T> => {
  const response = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/${path}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  const body = (await response.json()) as T & { error?: IGraphError };

  if (!response.ok) {
    throwGraphError(body.error, 'Meta API request failed');
  }

  return body;
};

export const subscribeWabaToApp = async (
  accessToken: string,
  businessAccountId: string,
): Promise<void> => {
  await graphPost<{ success?: boolean }>(
    `${businessAccountId}/subscribed_apps`,
    accessToken,
  );
};

export const unsubscribeWabaFromApp = async (
  accessToken: string,
  businessAccountId: string,
): Promise<void> => {
  await graphDelete<{ success?: boolean }>(
    `${businessAccountId}/subscribed_apps`,
    accessToken,
  );
};

export const registerWhatsappPhoneNumber = async (
  accessToken: string,
  phoneNumberId: string,
): Promise<void> => {
  await graphPost<{ success?: boolean }>(
    `${phoneNumberId}/register`,
    accessToken,
    { messaging_product: 'whatsapp' },
  );
};

// Resolves the Meta businesses visible in the authenticated context. The
// selected Facebook Page's business is preferred; when the page is not linked
// to a business, all businesses of the authenticated user are used.
const getBusinessIds = async (
  accessToken: string,
  pageId?: string,
): Promise<string[]> => {
  if (pageId) {
    try {
      const page = await graphGet<{ business?: { id: string } }>(
        `${pageId}?fields=business`,
        accessToken,
      );

      if (page.business?.id) {
        return [page.business.id];
      }
    } catch (e) {
      // Only an unsupported-edge response means "this page has no business
      // edge"; auth/rate-limit failures must surface instead of silently
      // falling back to every business of the user.
      if (!isUnsupportedGetError(e)) {
        throw e;
      }
    }
  }

  const businesses = await graphGet<IGraphListResponse<IMetaBusiness>>(
    'me/businesses?fields=id,name&limit=100',
    accessToken,
  );

  return (businesses.data || []).map(({ id }) => id);
};

export const getWhatsappPhoneNumbers = async (
  accessToken: string,
  businessAccountId: string,
): Promise<IWhatsappPhoneNumber[]> => {
  const response = await graphGet<
    IGraphListResponse<IMetaWhatsappPhoneNumber>
  >(
    `${businessAccountId}/phone_numbers?fields=id,display_phone_number,verified_name,status,is_on_biz_app&limit=100`,
    accessToken,
  );

  return (response.data || []).map((phoneNumber) => ({
    id: phoneNumber.id,
    displayPhoneNumber: phoneNumber.display_phone_number,
    verifiedName: phoneNumber.verified_name,
    status: phoneNumber.status,
    isOnBizApp: phoneNumber.is_on_biz_app,
  }));
};

const getBusinessWhatsappAccounts = async (
  accessToken: string,
  businessId: string,
): Promise<IMetaWhatsappBusinessAccount[]> => {
  const suppressUnsupported = async (
    request: Promise<IGraphListResponse<IMetaWhatsappBusinessAccount>>,
  ) => {
    try {
      return await request;
    } catch (e) {
      if (isUnsupportedGetError(e)) {
        return { data: [] } as IGraphListResponse<IMetaWhatsappBusinessAccount>;
      }
      throw e;
    }
  };

  const [owned, client] = await Promise.all([
    suppressUnsupported(
      graphGet<IGraphListResponse<IMetaWhatsappBusinessAccount>>(
        `${businessId}/owned_whatsapp_business_accounts?fields=id,name&limit=100`,
        accessToken,
      ),
    ),
    suppressUnsupported(
      graphGet<IGraphListResponse<IMetaWhatsappBusinessAccount>>(
        `${businessId}/client_whatsapp_business_accounts?fields=id,name&limit=100`,
        accessToken,
      ),
    ),
  ]);

  return [...(owned.data || []), ...(client.data || [])];
};

export const getWhatsappBusinessAccounts = async (
  accessToken: string,
  pageId?: string,
): Promise<IWhatsappBusinessAccount[]> => {
  const businessIds = await getBusinessIds(accessToken, pageId);

  const wabaLists = await Promise.all(
    businessIds.map((businessId) =>
      getBusinessWhatsappAccounts(accessToken, businessId),
    ),
  );

  const uniqueWabas = new Map<string, IMetaWhatsappBusinessAccount>();

  for (const waba of wabaLists.flat()) {
    uniqueWabas.set(waba.id, waba);
  }

  return Promise.all(
    [...uniqueWabas.values()].map(async (waba) => ({
      id: waba.id,
      name: waba.name || waba.id,
      phoneNumbers: await getWhatsappPhoneNumbers(accessToken, waba.id),
    })),
  );
};
