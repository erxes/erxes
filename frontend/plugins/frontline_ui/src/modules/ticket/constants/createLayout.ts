export const TICKET_PROPERTY_CONTENT_TYPE = 'frontline:ticket';
export const LAYOUT_PROPERTY_PREFIX = 'property:';

// Mirrors the backend list: system fields the create form can place in rows.
export const TICKET_CREATE_LAYOUT_SYSTEM_CODES = [
  'priority',
  'assigneeId',
  'entityIds',
  'startDate',
  'targetDate',
  'tagIds',
] as const;

export type TTicketLayoutSystemCode =
  (typeof TICKET_CREATE_LAYOUT_SYSTEM_CODES)[number];

// What a pipeline without its own layout shows: the form as it always was.
export const DEFAULT_TICKET_CREATE_LAYOUT: string[][] = [
  ['priority', 'assigneeId', 'entityIds'],
  ['startDate', 'targetDate', 'tagIds'],
];

export const TICKET_LAYOUT_SYSTEM_LABELS: Record<
  TTicketLayoutSystemCode,
  { key: string; fallback: string }
> = {
  priority: { key: 'priority', fallback: 'Priority' },
  assigneeId: { key: 'assignee', fallback: 'Assignee' },
  entityIds: {
    key: 'common:structure-entities.structure',
    fallback: 'Structure',
  },
  startDate: { key: 'start-date', fallback: 'Start date' },
  targetDate: { key: 'target-date', fallback: 'Target date' },
  tagIds: { key: 'tags', fallback: 'Tags' },
};

export const isTicketLayoutSystemCode = (
  id: string,
): id is TTicketLayoutSystemCode =>
  (TICKET_CREATE_LAYOUT_SYSTEM_CODES as readonly string[]).includes(id);

export const toLayoutPropertyId = (fieldId: string) =>
  `${LAYOUT_PROPERTY_PREFIX}${fieldId}`;

export const fromLayoutPropertyId = (id: string) =>
  id.startsWith(LAYOUT_PROPERTY_PREFIX)
    ? id.slice(LAYOUT_PROPERTY_PREFIX.length)
    : undefined;
