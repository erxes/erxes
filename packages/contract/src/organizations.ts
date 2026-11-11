import { oc } from '@orpc/contract';
import { z } from 'zod';
import { Id } from './common';

export const Organization = z.object({
  id: Id,
  subdomain: z.string(),
  name: z.string(),
  createdAt: z.string().datetime(),
});
export type Organization = z.infer<typeof Organization>;

export const organizationsContract = {
  current: oc
    .route({ method: 'GET', path: '/organization', summary: 'The organisation of the signed-in user or service token' })
    .output(Organization),
};
