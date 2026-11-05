import { ExtensionError } from 'erxes-sdk/server';
import type { IContext } from '../connectionResolver';
import { ResponseTemplateInput } from '../db/definitions/responseTemplates';
import { ExtResponseTemplatesFrontlineListDocument } from '../gql/graphql';

// frontline's cursor pagination allows at most 100 per page.
const IMPORT_PAGE_SIZE = 100;

type TemplateArgs = { name: string; content: string; channelId: string };

const notFound = () =>
  new ExtensionError('NOT_FOUND', 'Response template not found');

export const responseTemplateMutations = {
  async responseTemplatesAdd(
    _parent: undefined,
    args: TemplateArgs,
    { db, user }: IContext,
  ) {
    const { insertedId } = await db.ResponseTemplates.insertOne({
      ...ResponseTemplateInput.parse(args),
      files: [],
      createdBy: user._id,
    });
    const template = await db.ResponseTemplates.findOne({ _id: insertedId });

    if (!template) {
      throw notFound();
    }

    return template;
  },

  async responseTemplatesEdit(
    _parent: undefined,
    { _id, ...args }: TemplateArgs & { _id: string },
    { db }: IContext,
  ) {
    const template = await db.ResponseTemplates.findOneAndUpdate(
      { _id },
      { $set: ResponseTemplateInput.parse(args) },
      { returnDocument: 'after' },
    );

    if (!template) {
      throw notFound();
    }

    return template;
  },

  async responseTemplatesRemove(
    _parent: undefined,
    { _id }: { _id: string },
    { db }: IContext,
  ) {
    const template = await db.ResponseTemplates.findOneAndDelete({ _id });

    if (!template) {
      throw notFound();
    }

    return template;
  },

  /**
   * Copies one page of frontline's own templates, read as the caller, and
   * returns the cursor of the next page or null after the last. Upserts by
   * the frontline _id, so importing again updates the copies instead of
   * adding more, and overwrites edits made to them here.
   */
  async responseTemplatesImportFromFrontline(
    _parent: undefined,
    { cursor }: { cursor?: string | null },
    { db, gql, user }: IContext,
  ) {
    const { responseTemplates } = await gql(
      ExtResponseTemplatesFrontlineListDocument,
      { filter: { limit: IMPORT_PAGE_SIZE, cursor } },
    );
    const templates = (responseTemplates?.list ?? []).flatMap((template) =>
      template ? [template] : [],
    );

    // New templates only: every write sets updatedAt, so modifiedCount would
    // count unchanged ones too.
    const { upsertedCount } =
      templates.length > 0
        ? await db.ResponseTemplates.bulkWrite(
            templates.map(({ _id, name, content, channelId, files }) => ({
              updateOne: {
                filter: { sourceId: _id },
                update: {
                  $set: {
                    name: name ?? '',
                    content: content ?? '',
                    channelId: channelId ?? '',
                    files: (files ?? []).flatMap((file) =>
                      file ? [file] : [],
                    ),
                    createdBy: user._id,
                    sourceId: _id,
                  },
                },
                upsert: true,
              },
            })),
          )
        : { upsertedCount: 0 };
    const pageInfo = responseTemplates?.pageInfo;

    return {
      imported: upsertedCount,
      nextCursor: (pageInfo?.hasNextPage && pageInfo.endCursor) || null,
    };
  },
};
