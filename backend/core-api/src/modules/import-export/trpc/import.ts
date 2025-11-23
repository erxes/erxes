import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';
import { nanoid } from 'nanoid';
import { sendWorkerMessage } from 'erxes-api-shared/utils';

const t = initTRPC.context<CoreTRPCContext>().create();

export const importRouter = t.router({});
