import { randomUUID } from 'crypto';
import { TAutomationSetPropertyModifier } from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { toMediaIds } from '~/modules/ticket/meta/automations/actions/createTicketAction';
import {
  resolveConversationMedia,
  resolveInboxConversationId,
} from '~/modules/ticket/utils/conversationTickets';

type TBlock = { id: string; type: string };

const toParagraph = (text: string) => ({
  id: randomUUID(),
  type: 'paragraph',
  props: {
    textColor: 'default',
    backgroundColor: 'default',
    textAlignment: 'left',
  },
  content: text ? [{ type: 'text', text, styles: {} }] : [],
  children: [],
});

// The ticket editor stores its description as editor blocks; plain text is
// what an automation writes. Either is read back the same way.
const parseBlocks = (value: string): TBlock[] | null => {
  try {
    const parsed: unknown = JSON.parse(value);

    return Array.isArray(parsed) &&
      parsed.length > 0 &&
      parsed.every(
        (block) =>
          !!block &&
          typeof block === 'object' &&
          'id' in block &&
          'type' in block,
      )
      ? (parsed as TBlock[])
      : null;
  } catch {
    return null;
  }
};

// "concat" glues text onto the stored value. Onto editor blocks that breaks
// the JSON, so the added text becomes new paragraphs instead.
const normalizeDescription = (next: unknown, current: unknown) => {
  const currentText = typeof current === 'string' ? current : '';

  if (
    typeof next !== 'string' ||
    !currentText ||
    !next.startsWith(currentText) ||
    parseBlocks(next)
  ) {
    return next;
  }

  const appended = next.slice(currentText.length).trim();

  if (!appended) {
    return currentText;
  }

  const blocks = parseBlocks(currentText);

  return blocks
    ? JSON.stringify([...blocks, ...appended.split('\n').map(toParagraph)])
    : `${currentText}\n${appended}`;
};

const toIdList = (value: unknown) => {
  const raw =
    value && typeof value === 'object' && '$each' in value
      ? (value as { $each: unknown }).$each
      : value;

  return (Array.isArray(raw) ? raw : [raw]).flatMap((item) => toMediaIds(item));
};

// Manage properties writes conversation media ids; a ticket stores the files
// themselves, resolved only from the triggering conversation. Adding is always
// "add unique", so the same photo never lands on a ticket twice.
const resolveAttachmentWrites = async ({
  models,
  modifier,
  target,
}: {
  models: IModels;
  modifier: TAutomationSetPropertyModifier;
  target: Record<string, unknown>;
}) => {
  const hasAttachmentWrite = (
    ['$set', '$push', '$addToSet', '$pull'] as const
  ).some((operation) => modifier[operation]?.attachments !== undefined);

  if (!hasAttachmentWrite) {
    return modifier;
  }

  const targetConversationId =
    typeof target.conversationId === 'string' ? target.conversationId : '';
  const conversationIds = [
    targetConversationId,
    await resolveInboxConversationId(models, targetConversationId),
  ].filter((id): id is string => !!id);
  const resolve = (value: unknown) =>
    resolveConversationMedia({
      models,
      mediaIds: toIdList(value),
      conversationIds,
    });
  const next: TAutomationSetPropertyModifier = { ...modifier };

  if (modifier.$set?.attachments !== undefined) {
    next.$set = {
      ...modifier.$set,
      attachments: await resolve(modifier.$set.attachments),
    };
  }

  const added = [
    ...(modifier.$push?.attachments !== undefined
      ? await resolve(modifier.$push.attachments)
      : []),
    ...(modifier.$addToSet?.attachments !== undefined
      ? await resolve(modifier.$addToSet.attachments)
      : []),
  ];

  if (next.$push) {
    const otherPushes = Object.entries(next.$push).filter(
      ([field]) => field !== 'attachments',
    );

    // Mongo rejects an empty operator, so a push left with nothing goes.
    if (otherPushes.length) {
      next.$push = Object.fromEntries(otherPushes);
    } else {
      delete next.$push;
    }
  }

  if (
    modifier.$push?.attachments !== undefined ||
    modifier.$addToSet?.attachments !== undefined
  ) {
    next.$addToSet = {
      ...(next.$addToSet || {}),
      attachments: { $each: added },
    };
  }

  if (modifier.$pull?.attachments !== undefined) {
    const removed = await resolve(modifier.$pull.attachments);

    next.$pull = {
      ...modifier.$pull,
      attachments: { url: { $in: removed.map(({ url }) => url) } },
    };
  }

  return next;
};

export const prepareTicketPropertyWrite = async ({
  models,
  modifier,
  item,
  target,
}: {
  models: IModels;
  modifier: TAutomationSetPropertyModifier;
  item?: Record<string, unknown>;
  target: Record<string, unknown>;
}) => {
  const next = await resolveAttachmentWrites({ models, modifier, target });

  if (next.$set?.description !== undefined) {
    next.$set = {
      ...next.$set,
      description: normalizeDescription(
        next.$set.description,
        item?.description,
      ),
    };
  }

  return next;
};
