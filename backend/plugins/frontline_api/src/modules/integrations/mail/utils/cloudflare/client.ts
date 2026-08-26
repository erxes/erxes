import { describeError } from '@/integrations/mail/utils/errors';

const API_BASE = 'https://api.cloudflare.com/client/v4';

interface ICloudflareEnvelope<T> {
  success?: boolean;
  errors?: { code?: number; message?: string }[];
  result?: T;
}

export class CloudflareError extends Error {
  public readonly code: number;
  public readonly status: number;

  constructor(code: number, status: number, message: string) {
    super(message);

    this.name = 'CloudflareError';
    this.code = code;
    this.status = status;
  }
}

const readEnvelope = async <T>(response: Response) => {
  const text = await response.text();

  if (!text) {
    return {} as ICloudflareEnvelope<T>;
  }

  try {
    return JSON.parse(text) as ICloudflareEnvelope<T>;
  } catch {
    throw new CloudflareError(
      0,
      response.status,
      `Cloudflare answered ${response.status} with a body that is not json`,
    );
  }
};

export const cloudflareRequest = async <T>(
  token: string,
  path: string,
  init: RequestInit = {},
): Promise<T> => {
  const isForm = init.body instanceof FormData;

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      ...(isForm ? {} : { 'content-type': 'application/json' }),
      ...(init.headers ?? {}),
    },
  });

  const envelope = await readEnvelope<T>(response);

  if (!response.ok || envelope.success === false) {
    const first = envelope.errors?.[0];

    throw new CloudflareError(
      first?.code ?? 0,
      response.status,
      first?.message ?? `Cloudflare answered ${response.status}`,
    );
  }

  return envelope.result as T;
};

export const isCloudflareCode = (error: unknown, ...codes: number[]) =>
  error instanceof CloudflareError && codes.includes(error.code);

export const describeCloudflareError = (error: unknown) => {
  if (error instanceof CloudflareError) {
    return error.code
      ? `${error.message} (Cloudflare code ${error.code})`
      : error.message;
  }

  return describeError(error);
};
