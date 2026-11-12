import type { Block } from '@blocknote/core';
import { z } from 'zod';

// A mention's user id sits in `props._id`, the key stored documents already use.
const mentionUserId = z
  .object({
    type: z.literal('mention'),
    props: z.object({ _id: z.string() }),
  })
  .transform(({ props: { _id: userId } }) => userId);

export const getMentionedUserIds = (content: readonly Block[] | undefined) =>
  (content ?? []).flatMap((block) => {
    const inlineContent: readonly unknown[] = Array.isArray(block.content) ? block.content : [];

    return inlineContent.flatMap((item) => {
      const parsed = mentionUserId.safeParse(item);

      return parsed.success ? [parsed.data] : [];
    });
  });
