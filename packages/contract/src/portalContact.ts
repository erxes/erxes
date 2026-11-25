import { oc } from '@orpc/contract';
import { z } from 'zod';
import { EmailAddress } from './common';
import { COMMON_ERRORS, ERRORS } from './errors';

const { CONTACT_UNAVAILABLE, ORIGIN_NOT_ALLOWED, UNKNOWN_PORTAL } = ERRORS;

/** A visitor's message from the portal's contact form. */
const OneLine = z
  .string()
  .trim()
  .regex(/^[^\r\n]*$/, 'one line');

export const PortalContactInput = z.object({
  name: OneLine.min(1).max(200),
  email: EmailAddress,
  phone: OneLine.min(1).max(40).optional(),
  subject: OneLine.min(1).max(200).optional(),
  message: z.string().trim().min(10).max(5000),
});

export type PortalContactInput = z.infer<typeof PortalContactInput>;

/**
 * A portal's website writes to the organisation (decision 42): with `X-Portal-Token`, as
 * sign-in, from the portal's web addresses or a server.
 */
export const portalContactContract = {
  send: oc
    .errors({ ...COMMON_ERRORS, CONTACT_UNAVAILABLE, ORIGIN_NOT_ALLOWED, UNKNOWN_PORTAL })
    .route({
      method: 'POST',
      path: '/portal/contact',
      successStatus: 202,
      summary: 'Send a message to the organisation',
      description:
        "Emails the visitor's message to the portal's Reply-To (else the organisation's first verified Reply-To address), replying to the visitor, and adds the visitor to Contacts by email. 5 an hour per email address on the portal. 400 UNKNOWN_PORTAL, 401 UNAUTHORIZED, 403 ORIGIN_NOT_ALLOWED, 429 TOO_MANY_REQUESTS, 503 CONTACT_UNAVAILABLE (email isn't set up, or no address takes the message)",
    })
    .input(PortalContactInput)
    .output(z.object({ ok: z.literal(true) })),
};
