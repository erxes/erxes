/**
 * What an old activity log entry is about, and the sentence the timeline shows for it. Old
 * erxes wrote two kinds of entry: `contentType`/`action`/`content` (3.x), and later
 * `targetType`/`activityType`/`action: { type, description }`/`changes`. Both name the record by
 * an old type, which maps to core's customer and company or a plugin's record type.
 */

/** Old record types (every spelling old erxes used) → core's record types. */
const TARGETS: Record<string, string> = {
  'core:customer': 'customer',
  'contacts:customer': 'customer',
  'core:contacts.customers': 'customer',
  'tags:contacts:customer': 'customer',
  'core:lead': 'customer',
  customer: 'customer',
  lead: 'customer',
  visitor: 'customer',
  // A campaign entry is on the customer it was sent to.
  campaign: 'customer',
  'core:company': 'company',
  'contacts:company': 'company',
  'core:contacts.companies': 'company',
  'tags:contacts:company': 'company',
  company: 'company',
  'sales:deal': 'sales.deal',
  'sales:sales.deals': 'sales.deal',
  'sales:deal.deal': 'sales.deal',
  'sales:deal.deals': 'sales.deal',
  deal: 'sales.deal',
  'tasks:task': 'operation.task',
  'core:tasks:task': 'operation.task',
  'operation:task.tasks': 'operation.task',
  task: 'operation.task',
  'tickets:ticket': 'frontline.ticket',
  'frontline:tickets.tickets': 'frontline.ticket',
  ticket: 'frontline.ticket',
  'inbox:conversation': 'frontline.conversation',
  'core:inbox:conversation': 'frontline.conversation',
  'tags:inbox:conversation': 'frontline.conversation',
};

/** Core's record type for an old one, or null when no timeline has a place for it. */
export const targetOf = (oldType: string | null) => (oldType && TARGETS[oldType]) || null;

/** The plugin a record type belongs to, `core` for customers and companies. */
export const ownerOf = (targetType: string) =>
  targetType.includes('.') ? (targetType.split('.')[0] ?? 'core') : 'core';

export interface Names {
  members: Map<string, string>;
  tags: Map<string, string>;
  segments: Map<string, string>;
}

const listOf = (ids: unknown, names: Map<string, string>) =>
  (Array.isArray(ids) ? ids : [])
    .map((id) => (typeof id === 'string' ? (names.get(id) ?? 'a removed record') : ''))
    .filter(Boolean)
    .join(', ');

const textIn = (value: unknown, key: string) => {
  if (!value || typeof value !== 'object' || !(key in value)) return null;

  const inner: unknown = Object.entries(value).find(([name]) => name === key)?.[1];

  return typeof inner === 'string' && inner.trim() ? inner.trim() : null;
};

const valueIn = (value: unknown, key: string): unknown =>
  value && typeof value === 'object'
    ? Object.entries(value).find(([name]) => name === key)?.[1]
    : undefined;

/** The sentence for a 3.x entry (`action` and its `content`). */
export const classicSummary = (action: string, content: unknown, names: Names) => {
  switch (action) {
    case 'create':
      return 'Created';
    case 'segment': {
      const id = textIn(content, 'id');
      const name = textIn(content, 'content') ?? (id && names.segments.get(id));

      return name ? `Joined the segment "${name}"` : 'Joined a segment';
    }

    case 'moved':
      return textIn(content, 'text')
        ? `Moved: ${textIn(content, 'text')}`
        : 'Moved to another stage';
    case 'assignee': {
      const added = listOf(valueIn(content, 'addedUserIds'), names.members);
      const removed = listOf(valueIn(content, 'removedUserIds'), names.members);

      return (
        [added && `Assigned to ${added}`, removed && `Unassigned ${removed}`]
          .filter(Boolean)
          .join('; ') || 'Assignees changed'
      );
    }

    case 'tagged': {
      const tags = listOf(valueIn(content, 'tagIds'), names.tags);

      return tags ? `Tagged ${tags}` : 'Tags removed';
    }

    case 'convert':
      return typeof content === 'string' && content
        ? `Converted into record ${content}`
        : 'Converted';
    case 'archive':
      return 'Archived';
    case 'send':
      return textIn(content, 'title')
        ? `Sent the campaign "${textIn(content, 'title')}"`
        : 'Sent a campaign';
    case 'merge':
      return 'Merged other records into this one';
    default:
      return `${action.charAt(0).toUpperCase()}${action.slice(1)}`;
  }
};

/** The sentence for a later entry: its own description, else its type in words. */
export const laterSummary = (activityType: string | null, action: unknown) =>
  textIn(action, 'description') ??
  (activityType ? activityType.replaceAll(/[._]/g, ' ') : 'Changed');
