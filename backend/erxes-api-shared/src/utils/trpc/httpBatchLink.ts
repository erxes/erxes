import { httpBatchLink } from '@trpc/client';

type InternalHTTPLinkOptions = Pick<
  Parameters<typeof httpBatchLink>[0],
  'url' | 'headers' | 'fetch'
>;

export const createInternalHTTPBatchLink = (
  options: InternalHTTPLinkOptions,
): ReturnType<typeof httpBatchLink> =>
  httpBatchLink({ ...options, methodOverride: 'POST' });
