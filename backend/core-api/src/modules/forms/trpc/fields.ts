import { initTRPC } from '@trpc/server';
import { z } from 'zod';

import { CoreTRPCContext } from '~/init-trpc';
import {
  generateContactsFields,
  generateFieldsUsers,
  generateFormFields,
  generateProductsFields,
} from '../fields/utils';
import { fieldsCombinedByContentType } from '~/modules/forms/utils';

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
      .input(z.object({ _id: z.string() }))
      .query(async ({ ctx, input }) => {
        const { _id } = input;
        const { models } = ctx;
        return await models.Fields.findOne({ _id });
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
      }),

    generateTypedItem: t.procedure
      .input(
        z.object({
          field: z.string(),
          value: z.string(),
          type: z.string(),
          validation: z.string(),
        }),
      )
      .query(async ({ ctx, input }) => {
        const { models } = ctx;
        const { field, validation, value, type } = input;

        return await models.Fields.generateTypedItem(
          field,
          value,
          type,
          validation,
        );
      }),
    getFieldList: t.procedure
      .input(
        z.object({
          moduleType: z.string(),
          segmentId: z.string().optional(),
          usageType: z.string().optional(),
          config: z.record(z.any()).optional(),
        }),
      )
      .query(async ({ ctx, input }) => {
        const { subdomain } = ctx;
        const { moduleType } = input;

        switch (moduleType) {
          case 'lead':
            return generateContactsFields({ subdomain, data: input });
          case 'customer':
            return generateContactsFields({ subdomain, data: input });

          case 'company':
            return generateContactsFields({ subdomain, data: input });

          case 'product':
            return generateProductsFields({ subdomain, data: input });

          case 'form_submission':
            return generateFormFields({ subdomain, data: input });

          default:
            return generateFieldsUsers({ subdomain, data: input });
        }
      }),
    prepareCustomFieldsData: t.procedure
      .input(
        z.array(
          z.object({
            field: z.string(),
            value: z.any(),
            extraValue: z.string().optional(),
          }),
        ),
      )

      .query(async ({ ctx, input }) => {
        const { models } = ctx;
        return await models.Fields.prepareCustomFieldsData(
          input.map((item) => {
            return {
              field: item.field,
              value: item.value ?? '',
              extraValue: item.extraValue,
            };
          }),
        );
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
  }),
});
