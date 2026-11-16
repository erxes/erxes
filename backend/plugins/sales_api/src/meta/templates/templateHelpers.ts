import { TTemplateFill } from 'erxes-api-shared/core-modules';

export const DEALS = 'sales:sales.deals';
export const DEAL_PROBABILITY_TRIGGER = 'sales:sales.deals.probability';
export const POS_ORDER_EVENT = 'sales:pos.orders.event';
export const FORM_LINK = 'frontline:form.links.create';
export const SEGMENT_PART = 'core:segments.segment';
// Fires when a record enters a segment, checked again every night
export const SEGMENT_MEMBERSHIP = 'segmentMembership';

/** Where an answer lands in a journey's step. */
export const stepFill =
  (journey: string) =>
  (order: number, path: string, from?: string): TTemplateFill => ({
    target: 'step',
    journey,
    order,
    path,
    ...(from ? { from } : {}),
  });

// The email editor opens from `contentJson`; `content` is the html that is sent
export const emailBody = (lines: string[]) => ({
  content: lines.map((line) => `<p>${line}</p>`).join(''),
  contentJson: {
    type: 'doc',
    content: lines.map((text) => ({
      type: 'paragraph',
      content: [{ type: 'text', text }],
    })),
  },
  contentFormat: 'maily',
});

/** An email step's config with the sender left for the wizard to fill. */
export const emailStep = (to: string, subject: string, lines: string[]) => ({
  type: 'default',
  fromEmailPlaceHolder: '',
  replyToEmail: '',
  toEmailsPlaceHolders: to,
  ccEmailsPlaceHolders: '',
  subject,
  ...emailBody(lines),
  sender: '',
});

export const dealField = (
  fieldKey: string,
  operator: string,
  value?: string | number,
) => ({
  kind: 'field',
  contentType: DEALS,
  fieldKey,
  operator,
  ...(value === undefined ? {} : { value }),
});

/** Deals still in play: not archived, not in a Won or Lost stage. */
export const OPEN_DEAL_CONDITIONS = [
  dealField('status', 'e', 'active'),
  dealField('stageProbability', 'dne', 'Won'),
  dealField('stageProbability', 'dne', 'Lost'),
];
