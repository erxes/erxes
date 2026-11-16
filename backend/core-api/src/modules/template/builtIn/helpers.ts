import { TTemplateFill } from 'erxes-api-shared/core-modules';

export const CUSTOMERS = 'core:contacts.customers';
export const LEADS = 'core:contacts.leads';
export const SEGMENT_PART = 'core:segments.segment';
// Fires when a record enters a segment, checked again every night
export const SEGMENT_MEMBERSHIP = 'segmentMembership';

export const stepFill =
  (journey: string) =>
  (order: number, path: string, from?: string): TTemplateFill => ({
    target: 'step',
    journey,
    order,
    path,
    ...(from ? { from } : {}),
  });

/** The sender of every email step in a journey, as the wizard answers it. */
export const senderFills = (journey: string, orders: number[]) =>
  orders.flatMap((order) => [
    stepFill(journey)(order, 'replyToEmail', 'value'),
    stepFill(journey)(order, 'sender', 'name'),
  ]);

// The email editor opens from `contentJson`; `content` is the html that is sent
const emailBody = (lines: string[]) => ({
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

export const field = (
  contentType: string,
  fieldKey: string,
  operator: string,
  value?: string | number,
) => ({
  kind: 'field',
  contentType,
  fieldKey,
  operator,
  ...(value === undefined ? {} : { value }),
});

export const segmentPart = (
  key: string,
  name: string,
  contentType: string,
  children: ReturnType<typeof field>[],
) => ({
  key,
  type: SEGMENT_PART,
  label: 'Segment',
  icon: 'IconFilter',
  defaults: {
    name,
    contentType,
    root: { kind: 'group', conjunction: 'and', children },
  },
});

// Text fields compare as text; an address always holds an @
export const hasEmail = (contentType: string) =>
  field(contentType, 'primaryEmail', 'c', '@');
