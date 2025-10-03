import { initTRPC } from '@trpc/server';
import { sendTRPCMessage, ok, err } from 'erxes-api-shared/utils';
import { z } from 'zod';
import { createCard } from '~/modules/portal/utils/cards';
import { sendSms } from '~/modules/portal/utils/common';
import { ContentTRPCContext } from '~/trpc/init-trpc';

const t = initTRPC.context<ContentTRPCContext>().create();

export const portalRouter = t.router({
  findOne: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
    const { models } = ctx;
    try {
      const result = await models.Portals.findOne(input).lean();

      if (!result) {
        return err({
          code: 'NOT_FOUND',
          message: 'portal not found',
          suggestion: 'Please verify the search criteria',
        });
      }

      return ok(result);
    } catch (error) {
      console.error('FindOne operation failed:', error);

      return err({
        code: 'FIND_ONE_FAILED',
        message: 'Failed to find portal',
        details: error instanceof Error ? error.message : 'Database error',
        ...(process.env.NODE_ENV === 'development' && {
          stack: error instanceof Error ? error.stack : undefined,
        }),
      });
    }
  }),

  find: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
    const { models } = ctx;
    try {
      const result = await models.Portals.find(input).lean();

      return ok(result);
    } catch (error) {
      console.error('FindAll operation failed:', error);

      return err({
        code: 'FIND_ALL_FAILED',
        message: 'Failed to find all portals',
        details: error instanceof Error ? error.message : 'Database error',
        ...(process.env.NODE_ENV === 'development' && {
          stack: error instanceof Error ? error.stack : undefined,
        }),
      });
    }
  }),

  count: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
    const { models } = ctx;
    try {
      const result = await models.Portals.countDocuments(input);

      return ok(result);
    } catch (error) {
      console.error('Count operation failed:', error);

      return err({
        code: 'COUNT_FAILED',
        message: 'Failed to count portals',
        details: error instanceof Error ? error.message : 'Database error',
        ...(process.env.NODE_ENV === 'development' && {
          stack: error instanceof Error ? error.stack : undefined,
        }),
      });
    }
  }),

  sendSms: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
    const { type, to, content } = input;
    try {
      await sendSms(type, to, content);
      return {
        status: 'success',
        data: {},
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('SendSms operation failed:', error);

      return {
        status: 'error',
        error: {
          code: 'SEND_SMS_FAILED',
          message: 'Failed to send sms',
          details: error instanceof Error ? error.message : 'Database error',
          ...(process.env.NODE_ENV === 'development' && {
            stack: error instanceof Error ? error.stack : undefined,
          }),
        },
        timestamp: new Date().toISOString(),
      };
    }
  }),
});

export const portalUserRouter = t.router({
  findOne: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
    const { models } = ctx;
    try {
      const result = await models.Users.findOne(input).lean();

      if (!result) {
        return err({
          code: 'NOT_FOUND',
          message: 'Portal User not found',
          suggestion: 'Please verify the search criteria',
        });
      }

      return ok(result);
    } catch (error) {
      console.error('FindOne operation failed:', error);

      return err({
        code: 'FIND_ONE_FAILED',
        message: 'Failed to find portal user',
        details: error instanceof Error ? error.message : 'Database error',
        ...(process.env.NODE_ENV === 'development' && {
          stack: error instanceof Error ? error.stack : undefined,
        }),
      });
    }
  }),
  find: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
    const { models } = ctx;
    try {
      const result = await models.Users.find(input).lean();

      return ok(result);
    } catch (error) {
      console.error('Find operation failed:', error);

      return err({
        code: 'FIND_FAILED',
        message: 'Failed to find portal users',
        details: error instanceof Error ? error.message : 'Database error',
        ...(process.env.NODE_ENV === 'development' && {
          stack: error instanceof Error ? error.stack : undefined,
        }),
      });
    }
  }),
  count: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
    const { models } = ctx;
    try {
      const result = await models.Users.countDocuments(input);

      return ok(result);
    } catch (error) {
      console.error('Count operation failed:', error);

      return err({
        code: 'COUNT_FAILED',
        message: 'Failed to count portal users',
        details: error instanceof Error ? error.message : 'Database error',
        ...(process.env.NODE_ENV === 'development' && {
          stack: error instanceof Error ? error.stack : undefined,
        }),
      });
    }
  }),

  userIds: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
    const { models } = ctx;
    try {
      const result = await models.Users.find(input).distinct('_id');

      return ok(result);
    } catch (error) {
      console.error('Distinct operation failed:', error);

      return err({
        code: 'FIND_FAILED',
        message: 'Failed to find portal user ids',
        details: error instanceof Error ? error.message : 'Database error',
        ...(process.env.NODE_ENV === 'development' && {
          stack: error instanceof Error ? error.stack : undefined,
        }),
      });
    }
  }),

  create: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
    const { models } = ctx;
    try {
      const result = await models.Users.create(input);

      return ok(result);
    } catch (error) {
      console.error('Create operation failed:', error);

      return err({
        code: 'CREATE_FAILED',
        message: 'Failed to create portal user',
        details: error instanceof Error ? error.message : 'Database error',
        ...(process.env.NODE_ENV === 'development' && {
          stack: error instanceof Error ? error.stack : undefined,
        }),
      });
    }
  }),

  /* POST: bulk create / update (clientportal:clientPortalUsers.createOrUpdate) */
  createOrUpdate: t.procedure
    .input(z.object({ rows: z.array(z.any()) }))
    .mutation(async ({ ctx, input }) => {
      const { models } = ctx;
      const operations: any[] = [];

      for (const { selector, doc } of input.rows) {
        const existing = await models.Users.findOne(selector, {
          _id: 1,
        }).lean();

        if (existing) {
          operations.push({
            updateOne: { filter: selector, update: { $set: doc } },
          });
        } else {
          const customer = await sendTRPCMessage({
            pluginName: 'core',
            method: 'query',
            module: 'customers',
            action: 'findOne',
            input: { query: { primaryEmail: doc.email } },
            defaultValue: null,
          });

          if (doc.email && customer) {
            Object.assign(doc, {
              erxesCustomerId: customer._id,
              createdAt: new Date(),
              modifiedAt: new Date(),
            });
            operations.push({ insertOne: { document: doc } });
          }
        }
      }

      const result = await models.Users.bulkWrite(operations);
      return ok(result);
    }),

  /* POST: password validation (clientportal:clientPortalUsers.validatePassword) */
  validatePassword: t.procedure
    .input(
      z.object({
        userId: z.string(),
        password: z.string(),
        secondary: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { models } = ctx;
      const { userId, password, secondary } = input;

      const valid = await models.Users.validatePassword(
        userId,
        password,
        secondary,
      );
      if (!valid) {
        return err({
          code: 'INVALID_PASSWORD',
          message: 'Invalid password',
          details: 'Invalid password',
        });
      }
      return ok(valid);
    }),
});

export const portalNotificationRouter = t.router({
  /* GET: count engage notifs (clientportal:clientPortalEngageNotifications) */
  countEngage: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
    const { models } = ctx;
    try {
      const total = await models.Notifications.find(
        input.selector,
      ).countDocuments();
      return ok(total);
    } catch (e) {
      return err({
        code: 'COUNT_FAILED',
        message: 'Failed to count engage notifications',
        details: e instanceof Error ? e.message : 'Database error',
      });
    }
  }),

  /* POST: send notification (clientportal:sendNotification) */
  send: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
    const { models } = ctx;
    try {
      // TODO: implement this function
      // await sendNotification(models, input);   // <<< uses existing util
      return ok({});
    } catch (e) {
      return err({
        code: 'NOTIFICATION_FAILED',
        message: 'Failed to send notification',
        details: e instanceof Error ? e.message : 'Database error',
      });
    }
  }),
});

export const portalUserCardRouter = t.router({
  /* GET: cards (clientportal:clientPortalUserCards.find) */
  find: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
    const { models } = ctx;
    try {
      const list = await models.UserCards.find(input).lean();
      return ok(list);
    } catch (e) {
      return err({
        code: 'FIND_FAILED',
        message: 'Failed to find portal user cards',
        details: e instanceof Error ? e.message : 'Database error',
      });
    }
  }),

  /* GET: card owners (clientportal:clientPortalUserCards.users) */
  users: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
    const { models } = ctx;
    try {
      const cards = await models.UserCards.find(input).lean();
      const users = await models.Users.find({
        _id: { $in: cards.map((c) => c._id) },
      }).lean();
      return ok(users);
    } catch (e) {
      return err({
        code: 'FIND_USERS_FAILED',
        message: 'Failed to find portal user cards',
        details: e instanceof Error ? e.message : 'Database error',
      });
    }
  }),

  createCard: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
    const { models } = ctx;
    try {
      const { cpUser, doc } = input;
      const card = await createCard(models, cpUser, doc);
      return ok(card);
    } catch (e) {
      return err({
        code: 'CREATE_CARD_FAILED',
        message: 'Failed to create portal user card',
        details: e instanceof Error ? e.message : 'Database error',
      });
    }
  }),
});
