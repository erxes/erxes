import type { RouterClient } from '@orpc/server';
import { itemProcedures } from '#/modules/items/items.ts';

/** Every procedure, served at `/api/rpc/<group>/<name>`. */
export const router = {
  items: itemProcedures,
};

/** The typed client the UI builds (`ui/src/orpc.ts`). */
export type Client = RouterClient<typeof router>;
