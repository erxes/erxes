/** Email sending's value lists, kept as `./enums` is: one `as const` array each, no imports. */

/** How an organisation sends its emails, when not through the server's (`EMAIL_SMTP_URL`). */
export const EMAIL_PROVIDERS = ['smtp', 'sendgrid', 'ses'] as const;

/** A Reply-To address: confirmed by a link sent to it (SaaS), or verified at once. */
export const REPLY_TO_STATUSES = ['pending', 'verified'] as const;

/**
 * What an email was for: a member's account (invitation, password reset,
 * sign-in code), a security alert, a notification, a customer's notification,
 * a customer's sign-in code (`customer_account`), a broadcast's copy or test,
 * an automation's step, a plugin's message, an eBarimt receipt, or Settings
 * (a test, a Reply-To link).
 */
export const EMAIL_SOURCES = [
  'account',
  'security',
  'notification',
  'customer',
  'customer_account',
  'broadcast',
  'automation',
  'plugin',
  'ebarimt',
  'settings',
] as const;

/**
 * The emails someone waits for to get in or to set up sending: counted by the
 * sending ramp, never paced or halted by it; their own hourly cap stops a
 * flood to unproven addresses instead.
 */
export const EMAIL_AUTH_SOURCES = [
  'account',
  'security',
  'customer_account',
  'settings',
] as const satisfies readonly (typeof EMAIL_SOURCES)[number][];

/** Emails a day at each step of the sending ramp, from a new organisation's first. */
export const EMAIL_RAMP_TIERS = [500, 2000, 8000, 32_000, 128_000] as const;

/**
 * What an email went out through: SMTP, SendGrid or Amazon SES (the
 * organisation's own or the server's `EMAIL_SMTP_URL`), or `log` when
 * `EMAIL_DRIVER=log` (development: nothing left the server).
 */
export const EMAIL_DELIVERY_PROVIDERS = ['smtp', 'sendgrid', 'ses', 'log'] as const;

/**
 * Waiting for its job (or a retry), handed to the server, or given up on; then
 * what the provider's events tell: taken by the recipient's server, bounced,
 * or marked as spam. `suppressed`: never sent, the address is suppressed.
 * `held`: the sending ramp keeps it until its window (the day's limit is
 * used, or sending is halted), then it is queued. `capped`: never sent, over
 * the hourly cap of sign-in emails to unproven addresses.
 */
export const EMAIL_DELIVERY_STATUSES = [
  'queued',
  'sent',
  'delivered',
  'bounced',
  'complained',
  'failed',
  'suppressed',
  'held',
  'capped',
] as const;

/** Why the ramp holds an email: the day's limit is used, or sending is halted. */
export const EMAIL_HOLD_REASONS = ['daily_limit', 'halted'] as const;

/**
 * An address's standing, worked out when read: `proven` (the provider
 * reported a delivery to it lately), `suppressed` (it gets no email), or
 * `unknown`.
 */
export const EMAIL_LANES = ['proven', 'unknown', 'suppressed'] as const;

/** The statuses only a provider's event sets; the try's own settling never replaces them. */
export const EMAIL_REPORTED_STATUSES = ['delivered', 'bounced', 'complained'] as const;

/** What Amazon SNS posts to an HTTPS subscriber (SES's events come as `Notification`). */
export const SNS_MESSAGE_TYPES = [
  'Notification',
  'SubscriptionConfirmation',
  'UnsubscribeConfirmation',
] as const;

/** SNS signs with SHA1withRSA (`1`) or SHA256withRSA (`2`). */
export const SNS_SIGNATURE_VERSIONS = ['1', '2'] as const;

/** How often a recurring broadcast repeats: every N days, weeks or months. */
export const REPEAT_FREQUENCIES = ['day', 'week', 'month'] as const;

/**
 * Where a recurring broadcast's schedule stands: saved but not turned on
 * (`draft`, as a duplicate starts), creating its runs (`active`), held by a
 * member (`paused`), or done for good (`ended`: stopped, or past its end).
 */
export const REPEAT_STATES = ['draft', 'active', 'paused', 'ended'] as const;

/**
 * Pictures an email may show from erxes (`core_files.public`): formats every mail client
 * draws, never SVG, which can carry script.
 */
export const EMAIL_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'] as const;

/**
 * Nodes an email's document may hold: what the email editor writes and the renderer draws.
 * Raw HTML (`htmlCodeBlock`) and lists repeated over data (`repeat`) are left out.
 */
export const EMAIL_NODE_TYPES = [
  'doc',
  'body',
  'container',
  'section',
  'columns',
  'column',
  'paragraph',
  'heading',
  'text',
  'variable',
  'hardBreak',
  'image',
  'inlineImage',
  'inlineSpan',
  'spacer',
  'button',
  'footer',
  'blockquote',
  'horizontalRule',
  'bulletList',
  'orderedList',
  'listItem',
  'table',
  'tableRow',
  'tableCell',
  'tableHeader',
  'linkCard',
] as const;

/** Marks an email's text may carry. */
export const EMAIL_MARK_TYPES = [
  'bold',
  'italic',
  'strike',
  'underline',
  'link',
  'code',
  'textStyle',
  'highlight',
  'span',
] as const;
