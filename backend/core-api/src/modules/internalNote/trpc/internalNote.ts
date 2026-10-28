import { initTRPC, TRPCError } from '@trpc/server';
import { randomUUID } from 'crypto';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { z } from 'zod';
import { IModels } from '~/connectionResolvers';
import { CoreTRPCContext } from '~/init-trpc';
import { addInternalNote } from '~/modules/internalNote/services';

const t = initTRPC.context<CoreTRPCContext>().create();

const agentRecordId = z.string().regex(/^[A-Za-z0-9_-]{1,64}$/);

// Every agent write runs as the user whose chat session issued it; the
// HMAC-signed context carries that user's id.
const requireAgentUser = async (ctx: {
  models: IModels;
  userId?: string;
}) => {
  const user = ctx.userId
    ? await ctx.models.Users.findOne(
        { _id: ctx.userId, isActive: { $ne: false } },
        '_id email details isOwner groupIds brandIds username code',
      ).lean()
    : null;

  if (!user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Acting user not found',
    });
  }

  return user;
};

/**
 * The note UI renders BlockNote content; a non-block string falls back to
 * dangerouslySetInnerHTML, so raw model/user text must never be stored —
 * each line becomes a plain paragraph block instead.
 */
export const textToNoteBlocks = (text: string): string => {
  const lines = text.split(/\r?\n/);

  while (lines.length && !lines[0].trim()) {
    lines.shift();
  }
  while (lines.length && !lines[lines.length - 1].trim()) {
    lines.pop();
  }

  const blocks = lines.map((line) => ({
    id: randomUUID(),
    type: 'paragraph',
    props: {
      textColor: 'default',
      backgroundColor: 'default',
      textAlignment: 'left',
    },
    content: line ? [{ type: 'text', text: line, styles: {} }] : [],
    children: [],
  }));

  return JSON.stringify(blocks);
};

export const internalNoteTrpcRouter = t.router({
  internalNotes: t.router({
    add: t.procedure
      .input(
        z.object({
          contentType: z.enum([
            'core:customer',
            'core:company',
            'sales:deal',
          ]),
          contentTypeId: agentRecordId,
          content: z.string().trim().min(1).max(5000),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { models, subdomain } = ctx;
        const user = await requireAgentUser(ctx);

        const { contentType, contentTypeId, content } = input;

        let target: unknown = null;

        if (contentType === 'core:customer') {
          target = await models.Customers.findOne({
            _id: contentTypeId,
            status: { $ne: 'deleted' },
          }).lean();
        } else if (contentType === 'core:company') {
          target = await models.Companies.findOne({
            _id: contentTypeId,
            status: { $ne: 'deleted' },
          }).lean();
        } else {
          target = await sendTRPCMessage({
            subdomain,

            pluginName: 'sales',
            method: 'query',
            module: 'deal',
            action: 'findOne',
            input: { _id: contentTypeId },
            defaultValue: null,
          });
        }

        if (!target) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `${contentType} record not found`,
          });
        }

        const note = await addInternalNote({
          models,
          subdomain,
          user,
          doc: {
            contentType,
            contentTypeId,
            content: textToNoteBlocks(content),
            mentionedUserIds: [],
          },
        });

        if (!note) {
          throw new TRPCError({
            code: 'PRECONDITION_FAILED',
            message: `Internal notes are not available for ${contentType}`,
          });
        }

        return note;
      }),
  }),
});
