export async function generateTextCF(prompt: string) {
  const { CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID } = process.env;

  if (!CLOUDFLARE_API_TOKEN) {
    throw new Error('CLOUDFLARE_API_TOKEN is required for AI text generation');
  }

  const resp = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/meta/llama-2-7b-chat-int8`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    },
  );

  if (!resp.ok) {
    throw new Error(
      `Cloudflare AI API error: ${resp.status} ${resp.statusText}`,
    );
  }

  const { result } = await resp.json();

  if (!result) {
    throw new Error('No result returned from Cloudflare AI API');
  }

  return result.response;
}
