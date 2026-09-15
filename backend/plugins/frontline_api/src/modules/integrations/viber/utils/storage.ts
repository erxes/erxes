import { getPlugin } from 'erxes-api-shared/utils';
import { readViberMediaResponse } from './media';
import { isViberStorageKey } from './attachment';

export const getViberStoredFileUrl = async (
  subdomain: string,
  key: string,
): Promise<string> => {
  if (!subdomain.trim()) throw new Error('Subdomain is required');
  if (!isViberStorageKey(key)) throw new Error('Invalid Viber storage key');

  const { address } = await getPlugin('core');
  const url = new URL(address);
  if (
    !['https:', 'http:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new Error('Invalid file service URL');
  }
  // Call the public Core file route through the same discovery used by Gateway.
  url.pathname = `${url.pathname.replace(/\/+$/, '')}/read-file`;
  url.searchParams.set('key', key);
  return url.toString();
};

export const readViberStoredFile = async (
  subdomain: string,
  key: string,
): Promise<Buffer> => {
  // Only the configured Core endpoint is fetched, never a caller's remote URL.
  const response = await fetch(await getViberStoredFileUrl(subdomain, key), {
    headers: { 'nginx-hostname': subdomain },
    redirect: 'error',
    signal: AbortSignal.timeout(30_000),
  });
  const { buffer } = await readViberMediaResponse(response, 'file');
  if (!buffer.length) throw new Error('Viber attachment is empty');
  return buffer;
};
