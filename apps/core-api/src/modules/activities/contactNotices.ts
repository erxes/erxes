import type { ContentType } from '@erxes/core-db';
import type { Actor } from '~/http/auth';
import { currentImport } from '~/lib/causation';
import type { NotifyInput } from '~/modules/notifications/notifications.service';
import { contactLabel, type ContactRow, detailLink } from './contactRecords';

/** The notifications a customer or company change sends; `notify` takes them all at once. */

/** What a record's owners are told about what someone else did to it (never the one who did it). */
export const ownerNotice = (
  actor: Actor,
  type: ContentType,
  owners: (string | null)[],
  input: {
    verb: 'updated' | 'merged' | 'deleted';
    title: string;
    body: string;
    recordId: string;
    link?: string;
    data?: Record<string, unknown>;
  },
): NotifyInput[] => {
  const userIds = [
    ...new Set(owners.filter((id): id is string => Boolean(id) && id !== actor.userId)),
  ];

  if (!userIds.length) return [];

  return [
    {
      userIds,
      kind: `core.${type}.${input.verb}`,
      title: input.title,
      body: input.body,
      link: input.link,
      entity: { type, id: input.recordId },
      data: input.data,
      // Several quick edits by one person become one notification.
      collapseMinutes: input.verb === 'updated' ? 30 : undefined,
    },
  ];
};

/** What a record's new owner is told, unless they made themselves the owner. */
export const newOwnerNotice = (
  actor: Actor,
  type: ContentType,
  row: ContactRow,
  before: string | null,
): NotifyInput[] => {
  // A quiet import tells nobody about each row (the importer sees the summary).
  if (currentImport()?.quiet) return [];

  if (!row.ownerId || row.ownerId === before || row.ownerId === actor.userId) return [];

  return [
    {
      userIds: [row.ownerId],
      kind: `core.${type}.assigned`,
      title:
        type === 'customer' ? 'A customer was assigned to you' : 'A company was assigned to you',
      body: contactLabel(type, row),
      link: detailLink(type, row.id),
      entity: { type, id: row.id },
    },
  ];
};
