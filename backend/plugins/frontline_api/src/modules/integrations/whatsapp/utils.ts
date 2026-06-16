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
