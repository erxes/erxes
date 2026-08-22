import fetch from 'node-fetch';

const GRAPH_VERSION = 'v21.0';

interface ISendTextParams {
  accessToken: string;
  phoneNumberId: string;
  recipientPhone: string;
  text: string;
}

export const sendWhatsappText = async ({
  accessToken,
  phoneNumberId,
  recipientPhone,
  text,
}: ISendTextParams): Promise<{ messages?: Array<{ id?: string }> }> => {
  const response = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipientPhone,
        type: 'text',
        text: {
          preview_url: false,
          body: text,
        },
      }),
    },
  );

  const body = (await response.json()) as {
    messages?: Array<{ id?: string }>;
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(body.error?.message || 'Failed to send WhatsApp message');
  }

  return body;
};

interface IGraphListResponse<T> {
  data?: T[];
  error?: { message?: string };
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
}

export interface IWhatsappPhoneNumber {
  id: string;
  displayPhoneNumber?: string;
  verifiedName?: string;
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

  const body = (await response.json()) as T & { error?: { message?: string } };

  if (!response.ok) {
    throw new Error(body.error?.message || 'Meta API request failed');
  }

  return body;
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
    } catch (_e) {
      // Page is not linked to a business, fall back to the user businesses
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
    `${businessAccountId}/phone_numbers?fields=id,display_phone_number,verified_name&limit=100`,
    accessToken,
  );

  return (response.data || []).map((phoneNumber) => ({
    id: phoneNumber.id,
    displayPhoneNumber: phoneNumber.display_phone_number,
    verifiedName: phoneNumber.verified_name,
  }));
};

const getBusinessWhatsappAccounts = async (
  accessToken: string,
  businessId: string,
): Promise<IMetaWhatsappBusinessAccount[]> => {
  const [owned, client] = await Promise.all([
    graphGet<IGraphListResponse<IMetaWhatsappBusinessAccount>>(
      `${businessId}/owned_whatsapp_business_accounts?fields=id,name&limit=100`,
      accessToken,
    ).catch(() => ({ data: [] })),
    graphGet<IGraphListResponse<IMetaWhatsappBusinessAccount>>(
      `${businessId}/client_whatsapp_business_accounts?fields=id,name&limit=100`,
      accessToken,
    ).catch(() => ({ data: [] })),
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
