import { initTRPC } from '@trpc/server';
import { z } from 'zod';

import { CoreTRPCContext } from '~/init-trpc';
import { fieldsCombinedByContentType } from '~/modules/forms/utils';
import {
  generateContactsFields,
  generateFieldsUsers,
  generateProductsFields,
} from '../fields/utils';

const t = initTRPC.context<CoreTRPCContext>().create();

export const fieldsTrpcRouter = t.router({
  fields: t.router({
    find: t.procedure
      .input(z.object({ query: z.any(), projection: z.any(), sort: z.any() }))
      .query(async ({ ctx, input }) => {
        const { query, projection, sort } = input;
        const { models } = ctx;
        return await models.Fields.find(query, projection).sort(sort).lean();
      }),
    findOne: t.procedure
      .input(z.object({ _id: z.string().optional(), query: z.record(z.any()).optional() }))
      .query(async ({ ctx, input }) => {
        const { _id, query } = input;
        const { models } = ctx;
        return await models.Fields.findOne(query || { _id });
      }),
    create: t.procedure
      .input(z.record(z.any()))
      .mutation(async ({ ctx, input }) => {
        const { models } = ctx;
        const order = await models.Fields.findOne({ contentType: input.contentType })
          .sort({ order: -1 })
          .lean()
          .then((f) => (f?.order || 0) + 10);
        return await models.Fields.create({ ...input, order, isDefinedByErxes: false });
      }),
    updateOne: t.procedure
      .input(z.object({ selector: z.record(z.any()), modifier: z.record(z.any()) }))
      .mutation(async ({ ctx, input }) => {
        const { selector, modifier } = input;
        const { models } = ctx;
        return await models.Fields.updateOne(selector, modifier);
      }),
    prepareCustomFieldsData: t.procedure
      .input(z.array(z.object({ field: z.string(), value: z.any() })))
      .mutation(async ({ ctx, input }) => {
        const { models } = ctx;
        const result: any[] = [];
        for (const item of input) {
          const { field: fieldId, value } = item;
          const fieldDoc = await models.Fields.findOne({ _id: fieldId }).lean();
          const extra: any = {};
          if (fieldDoc) {
            const { type, validation } = fieldDoc as any;
            if (type === 'number' || (type === 'input' && validation === 'number')) {
              extra.numberValue = Number(value);
            } else if (['text', 'textarea', 'input'].includes(type || '')) {
              extra.stringValue = String(value);
            } else if (type === 'date') {
              extra.dateValue = value;
            }
          }
          result.push({ field: fieldId, value, ...extra });
        }
        return result;
      }),
    updateMany: t.procedure
      .input(
        z.object({
          selector: z.record(z.any()),
          modifier: z.record(z.any()),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { models } = ctx;
        const { selector, modifier } = input;
        return await models.Customers.updateMany(selector, modifier);
      }),

    getFieldList: t.procedure
      .input(
        z.object({
          moduleType: z.string(),
          collectionType: z.string().optional(),
          segmentId: z.string().optional(),
          usageType: z.string().optional(),
          config: z.record(z.any()).optional(),
        }),
      )
      .query(async ({ ctx, input }) => {
        const { subdomain } = ctx;
        const { moduleType } = input;
        switch (moduleType) {
          case 'contact':
            return generateContactsFields({ subdomain, data: input });

          case 'product':
            return generateProductsFields({ subdomain, data: input });

          default:
            return generateFieldsUsers({ subdomain, data: input });
        }
      }),
    fieldsCombinedByContentType: t.procedure
      .input(
        z.object({
          contentType: z.string(),
          usageType: z.string().optional(),
          excludedNames: z.array(z.string()).optional(),
          segmentId: z.string().optional(),
          config: z.any().optional(),
          onlyDates: z.boolean().optional(),
        }),
      )
      .query(async ({ ctx, input }) => {
        const { subdomain, models } = ctx;
        return await fieldsCombinedByContentType(models, subdomain, input);
      }),
    validateFieldValues: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { data } = input;
        const { models } = ctx;

        return await models.Fields.validateFieldValues(data);
      }),
  }),
});
