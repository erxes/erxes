import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { FrontlineTRPCContext } from '~/init-trpc';

const t = initTRPC.context<FrontlineTRPCContext>().create();

export const formTrpcRouter = t.router({
  form: t.router({
    submissionsByConversation: t.procedure
      .input(z.object({ conversationId: z.string() }))
      .query(async ({ ctx, input }) => {
        const { models } = ctx;
        const { conversationId } = input;

        const submissionDocs = await models.FormSubmissions.find({
          conversationId,
        }).lean();
        console.log('[form-activity] submissionsByConversation', {
          conversationId,
          count: submissionDocs.length,
        });

        if (!submissionDocs.length) {
          return null;
        }

        const formId = submissionDocs.find((doc) => doc.formId)?.formId;
        const form = formId
          ? await models.Forms.findOne({ _id: formId }).lean()
          : null;

        const fields = formId
          ? await models.Fields.find({ contentTypeId: formId }).lean()
          : [];
        const labelById = new Map<string, string>(
          fields.map((field: any) => [
            String(field._id),
            field.text || field.label || '',
          ]),
        );

        const submissions = submissionDocs.map((doc: any) => ({
          label:
            labelById.get(String(doc.formFieldId)) || doc.formFieldId || '',
          value: doc.value,
        }));

        return {
          formId,
          formTitle: form?.title,
          submissions,
        };
      }),
  }),
});
