import { initTRPC } from '@trpc/server';
import { generateElkId } from 'erxes-api-shared/utils';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';
import { fetchSegment } from '../utils/fetchSegment';

const t = initTRPC.context<CoreTRPCContext>().create();

export const optionsSchema = z
  .object({
    returnAssociated: z
      .object({
        mainType: z.string(),
        relType: z.string(),
      })
      .optional(),
    returnFields: z.array(z.string()).optional(),
    returnFullDoc: z.boolean().optional(),
    returnSelector: z.boolean().optional(),
    returnCount: z.boolean().optional(),
    defaultMustSelector: z.array(z.any()).optional(),
    page: z.number().optional(),
    perPage: z.number().optional(),
    sortField: z.string().optional(),
    sortDirection: z.number().optional(),
    scroll: z.boolean().optional(),
  })
  .optional();

export const segmentsRouter = t.router({
  segment: t.router({
    isInSegment: t.procedure
      .meta({
        agent: {
          description:
            'Check whether ONE record belongs to a segment. Input: { segmentId, idToCheck } — idToCheck is the record _id (e.g. a customer _id). Returns true/false. Use segment.fetchSegment instead when you need the full member list.',
          permission: { module: 'segments', action: 'segmentsRead' },
        },
      })
      .input(
        z.object({
          segmentId: z.string(),
          idToCheck: z.string(),
          options: optionsSchema,
        }),
      )
      .query(async ({ input, ctx }) => {
        const { segmentId, idToCheck, options = {} } = input;
        const { models, subdomain } = ctx;

        const segment = await models.Segments.getSegment(segmentId);
        let defaultMustSelectorFieldName = '_id';

        if (!segment?.name && segment.contentType === 'core:form_submission') {
          defaultMustSelectorFieldName = 'customerId';
        }

        options.returnCount = true;
        options.defaultMustSelector = [
          {
            match: {
              [defaultMustSelectorFieldName]: await generateElkId(
                idToCheck,
                subdomain,
              ),
            },
          },
        ];

        const count = await fetchSegment(models, subdomain, segment, options);

        return count > 0;
      }),
    fetchSegment: t.procedure
      .meta({
        agent: {
          description:
            'Fetch the records that belong to a segment. Input: { segmentId?, options? } — options.returnCount=true returns only the count; options.returnFields limits columns; options.page/perPage paginate; options.returnFullDoc=true returns full documents. Call segment.findOne first to confirm the segment exists and see what content type and conditions it filters.',
          permission: { module: 'segments', action: 'segmentsRead' },
        },
      })
      .input(
        z.object({
          segmentId: z.string().optional(),
          segmentData: z.string().optional(),
          options: optionsSchema,
        }),
      )
      .query(async ({ input, ctx }) => {
        const { models, subdomain } = ctx;

        const { segmentId, options, segmentData } = input;

        const segment = segmentData
          ? segmentData
          : await models.Segments.findOne({ _id: segmentId }).lean();

        return await fetchSegment(models, subdomain, segment, options);
      }),
    findOne: t.procedure
      .meta({
        agent: {
          description:
            'Get a segment definition by ID: { _id }. Returns the segment name, contentType (what entity it filters, e.g. "core:contacts.customers"), and its conditions. Call this before segment.fetchSegment or segment.isInSegment to understand what the segment contains.',
          permission: { module: 'segments', action: 'segmentsRead' },
        },
      })
      .input(z.object({ _id: z.string() }))
      .query(async ({ input, ctx }) => {
        const { models } = ctx;

        return await models.Segments.findOne({ _id: input._id }).lean();
      }),
  }),
});
