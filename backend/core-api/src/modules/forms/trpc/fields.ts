import { initTRPC } from '@trpc/server';
import { z } from 'zod';

import { CoreTRPCContext } from '~/init-trpc';
import { agentMeta } from '~/utils/agentMeta';
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
      .meta(
        agentMeta(
          'List custom field definitions: { query, projection?, sort? }, e.g. { query: { contentType: "core:contacts.customers" } }. Returns field metadata (name, label, type, validation, options). For a complete field list including built-in schema fields, use fields.fieldsCombinedByContentType instead.',
          { module: 'properties', action: 'propertiesRead' },
        ),
      )
      .input(z.object({ query: z.any(), projection: z.any(), sort: z.any() }))
      .query(async ({ ctx, input }) => {
        const { query, projection, sort } = input;
        const { models } = ctx;
        return await models.Fields.find(query, projection).sort(sort).lean();
      }),
    findOne: t.procedure
      .meta(
        agentMeta(
          'Get a single custom field definition by { _id } or { query: {...} }. Returns the field metadata (type, validation, options) needed to format values for fields.prepareCustomFieldsData.',
          { module: 'properties', action: 'propertiesRead' },
        ),
      )
      .input(
        z.object({
          _id: z.string().optional(),
          query: z.record(z.any()).optional(),
        }),
      )
      .query(async ({ ctx, input }) => {
        const { _id, query } = input;
        const { models } = ctx;
        const filter = _id ? { _id } : query;
        if (!filter || !Object.keys(filter).length) {
          return {};
        }
        return await models.Fields.findOne(filter);
      }),
    create: t.procedure
      .input(z.record(z.any()))
      .mutation(async ({ ctx, input }) => {
        const { models } = ctx;
        const order = await models.Fields.findOne({
          contentType: input.contentType,
        })
          .sort({ order: -1 })
          .lean()
          .then((f) => (f?.order || 0) + 10);
        return await models.Fields.create({
          ...input,
          order,
          isDefinedByErxes: false,
        });
      }),
    updateOne: t.procedure
      .input(
        z.object({ selector: z.record(z.any()), modifier: z.record(z.any()) }),
      )
      .mutation(async ({ ctx, input }) => {
        const { selector, modifier } = input;
        const { models } = ctx;
        if (!selector || !Object.keys(selector).length) {
          return {};
        }
        return await models.Fields.updateOne(selector, modifier);
      }),
    prepareCustomFieldsData: t.procedure
      .meta(
        agentMeta(
          'Format raw custom field values into typed customFieldsData entries. Input: [{ field, value }] where field is the custom field _id. Returns entries with the correct stringValue/numberValue/dateValue extras. Pure transformation — writes nothing to the database. Pass the result as doc.customFieldsData in customers.createCustomer / customers.updateCustomer / companies.createCompany / companies.updateCompany. Discover field IDs first via fields.fieldsCombinedByContentType.',
          { module: 'properties', action: 'propertiesRead' },
        ),
      )
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
            if (
              type === 'number' ||
              (type === 'input' && validation === 'number')
            ) {
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
      .meta(
        agentMeta(
          'Get the full field list (built-in schema fields + custom fields) for a module. Input: { moduleType, collectionType?, usageType? } — moduleType is "contacts" (with collectionType "customers" or "companies"), "product", or "users". Use to discover which fields exist before building filters, imports, or create/update docs.',
          { module: 'properties', action: 'propertiesRead' },
        ),
      )
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
          case 'contacts':
            return generateContactsFields({ subdomain, data: input });

          case 'product':
            return generateProductsFields({ subdomain, data: input });

          default:
            return generateFieldsUsers({ subdomain, data: input });
        }
      }),
    fieldsCombinedByContentType: t.procedure
      .meta(
        agentMeta(
          'Get ALL fields (built-in schema fields + custom fields with select options) for one content type. Input: { contentType, usageType?, excludedNames? } — contentType format "plugin:module.collection", e.g. "core:contacts.customers", "core:contacts.companies", "core:products.product", "core:organization.users". Call this BEFORE writing customFieldsData on any create/update to learn the custom field IDs and their types, then format values with fields.prepareCustomFieldsData.',
          { module: 'properties', action: 'propertiesRead' },
        ),
      )
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
    generatePropertiesData: t.procedure
      .input(
        z.object({
          query: z.object({
            customData: z.record(z.any()).optional(),
            contentType: z.string(),
          }),
        }),
      )
      .query(async ({ ctx, input }) => {
        const { customData, contentType } = input.query;
        const { models } = ctx;

        return await models.Fields.generatePropertiesData(
          customData || {},
          contentType,
        );
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
