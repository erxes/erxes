import { httpBatchStreamLink, createTRPCUntypedClient } from '@trpc/client';
import { getPlugin } from 'erxes-api-shared/utils';
// import { getService } from 'erxes-api-shared/utils';

export const coreClient = async () => {
  const coreService = await getPlugin('core');

  return createTRPCUntypedClient({
    links: [
      httpBatchStreamLink({
        url: `${coreService.address}/trpc`,
      }),
    ],
  });
};
