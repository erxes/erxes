import {
  CloudflareError,
  cloudflareRequest,
} from '@/integrations/mail/utils/cloudflare/client';
import { cloudflareSettings } from '@/customdomain/constants';

export interface ICloudflareCustomHostname {
  id: string;
  hostname: string;
  status?: string;
  verification_errors?: string[];
  ownership_verification?: { type?: string; name?: string; value?: string };
  ssl?: {
    status?: string;
    method?: string;
    txt_name?: string;
    txt_value?: string;
    validation_records?: { txt_name?: string; txt_value?: string }[];
    validation_errors?: { message?: string }[];
  };
}

const request = <T>(path: string, init?: RequestInit) => {
  const { zoneId, token } = cloudflareSettings();

  return cloudflareRequest<T>(
    token,
    `/zones/${zoneId}/custom_hostnames${path}`,
    init,
  );
};

export const createCustomHostname = (hostname: string) =>
  request<ICloudflareCustomHostname>('', {
    method: 'POST',
    body: JSON.stringify({
      hostname,
      ssl: {
        method: 'txt',
        type: 'dv',
        settings: { min_tls_version: '1.2' },
      },
    }),
  });

export const getCustomHostname = (id: string) =>
  request<ICloudflareCustomHostname>(`/${id}`);

export const deleteCustomHostname = async (id: string) => {
  try {
    await request(`/${id}`, { method: 'DELETE' });
  } catch (e) {
    // Already gone on Cloudflare's side is the outcome we wanted.
    if (e instanceof CloudflareError && e.status === 404) {
      return;
    }

    throw e;
  }
};
