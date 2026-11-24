import { emailRamps } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { isoDate } from './common';
import { COMMON_ERRORS } from './errors';

/** Whether the organisation's email is paced now: what a broadcast's page shows. */
export const EmailPacing = z.object({
  /** The bounce and complaint rate halted sending: only sign-in and account emails go out. */
  halted: z.boolean(),
  /** Today's limit is used: emails wait for `until`. */
  limitReached: z.boolean(),
  /** When held emails are next let through (the next UTC day); null when nothing waits. */
  until: isoDate().nullable(),
});

export type EmailPacing = z.infer<typeof EmailPacing>;

/**
 * The organisation's sending ramp: its daily limit and today's count, the
 * last 7 days' bounce and complaint rates against the lines that move it,
 * and whether it is halted.
 */
export const EmailLimits = createSelectSchema(emailRamps, {
  tier: () => z.int(),
  sentToday: () => z.int(),
  tierChangedAt: isoDate,
  evaluatedAt: isoDate,
  haltedAt: isoDate,
  resumedAt: isoDate,
})
  .pick({
    /** The step on `tiers` (0 first). */
    tier: true,
    /** Off: erxes neither paces nor halts (self-hosted with its own SendGrid or SES only). */
    enabled: true,
    /** Emails counted today (UTC), sign-in and account ones too. */
    sentToday: true,
    /** When the step last moved: it moves once a day at most. */
    tierChangedAt: true,
    /** When the rates were last measured. */
    evaluatedAt: true,
    /** Set while sending is halted. */
    haltedAt: true,
    haltReason: true,
    /** The last resume: who, when and why; the rates count from then. */
    resumedAt: true,
    resumedBy: true,
    resumeReason: true,
  })
  .extend({
    /** Pacing and halting apply now. */
    active: z.boolean(),
    /** False when the provider (an SMTP server) reports no bounces: the ramp is off. */
    measured: z.boolean(),
    /** Self-hosted, sending through its own SendGrid or SES: the ramp may be turned off. */
    canTurnOff: z.boolean(),
    /** Emails a day at each step. */
    tiers: z.array(z.int()),
    /** Today's limit. */
    limit: z.int(),
    /** Emails held now, waiting for the next window or a resume. */
    held: z.int(),
    /** When the next day's allowance opens (UTC midnight). */
    nextWindowAt: isoDate(),
    /** The rates count from here: 7 days ago, or the last resume. */
    windowSince: isoDate(),
    windowDays: z.int(),
    /** Emails the server took in the window, and of them bounced and complained about. */
    windowSent: z.int(),
    windowBounced: z.int(),
    windowComplained: z.int(),
    /** (bounced + complained) / sent, 0–1. */
    rate: z.number(),
    /** Below this rate the limit goes up a step. */
    advanceBelow: z.number(),
    /** At this rate it goes down a step. */
    stepDownAt: z.number(),
    /** At this rate sending halts. */
    haltAt: z.number(),
    /** Fewer emails in the window say nothing about the rate yet. */
    minSample: z.int(),
    /** Emails the window must hold before the next step up; null at the top. */
    advanceSentNeeded: z.int().nullable(),
    /** The next step up is not before this (a day after the last move); null: any time. */
    advanceNotBefore: isoDate().nullable(),
    /** Sign-in and account emails an hour to unproven addresses, and how many the last hour sent. */
    authCapPerHour: z.int(),
    authUnprovenLastHour: z.int(),
  });

export type EmailLimits = z.infer<typeof EmailLimits>;

/**
 * The sending ramp (Settings › Organization email › Limits,
 * `integrations.manage`): every email counts against a daily limit that
 * grows with a low bounce rate; at 10% sending halts until an admin resumes
 * with a reason. SaaS: always on, `setRamp` answers 402 NOT_IN_PLAN.
 */
export const emailLimitsContract = {
  limits: oc
    .errors(COMMON_ERRORS)
    .route({
      method: 'GET',
      path: '/email/limits',
      summary: 'Get email sending limits',
      description:
        'The sending ramp: today’s limit and count, the rates, and whether sending is halted',
    })
    .output(EmailLimits),
  pacing: oc
    .errors(COMMON_ERRORS)
    .route({
      method: 'GET',
      path: '/email/pacing',
      summary: 'Check whether emails are held',
      description: 'Whether emails are held now: sending halted, or today’s limit used',
    })
    .output(EmailPacing),
  resumeSending: oc
    .errors(COMMON_ERRORS)
    .route({
      method: 'POST',
      path: '/email/limits/resume',
      summary: 'Resume email sending',
      description:
        'Resume halted sending, saying why: the limit goes down a step, held emails go out, and the rates count from now',
    })
    .input(z.object({ reason: z.string().trim().min(1).max(500) }))
    .output(EmailLimits),
  setRamp: oc
    .errors(COMMON_ERRORS)
    .route({
      method: 'PUT',
      path: '/email/limits/ramp',
      summary: 'Turn the sending ramp on or off',
      description:
        'Turn the sending ramp off or on. Self-hosted with its own SendGrid or SES only: 402 NOT_IN_PLAN on SaaS, 400 INVALID_INPUT otherwise',
    })
    .input(z.object({ enabled: z.boolean() }))
    .output(EmailLimits),
};
