const encoder = new TextEncoder();

const HEX_PATTERN = /^[0-9a-f]+$/i;

const importKey = (secret: string, usage: 'sign' | 'verify') =>
  crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    [usage],
  );

export const toHex = (buffer: ArrayBuffer) =>
  [...new Uint8Array(buffer)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

const fromHex = (value: string) => {
  const bytes = new Uint8Array(value.length / 2);

  for (let index = 0; index < bytes.length; index++) {
    bytes[index] = Number.parseInt(value.slice(index * 2, index * 2 + 2), 16);
  }

  return bytes;
};

export const sign = async (payload: string, secret: string) =>
  toHex(
    await crypto.subtle.sign(
      'HMAC',
      await importKey(secret, 'sign'),
      encoder.encode(payload),
    ),
  );

export const deriveTenantSecret = (master: string, tenant: string) =>
  sign(tenant, master);

export const verify = async (
  payload: string,
  signature: string,
  secret: string,
) => {
  if (signature.length % 2 !== 0 || !HEX_PATTERN.test(signature)) {
    return false;
  }

  return crypto.subtle.verify(
    'HMAC',
    await importKey(secret, 'verify'),
    fromHex(signature),
    encoder.encode(payload),
  );
};
