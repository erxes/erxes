import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { IInternalNoteParams } from '~/modules/internalNote/types';

export const internalNoteQueries = {
  internalNoteDetail: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return await models.InternalNotes.getInternalNote(_id);
  },

  /**
   * InternalNotes list
   */
  async internalNotes(
    _parent: undefined,
    {
      contentType,
      contentTypeId,
    }: { contentType: string; contentTypeId: string },
    { models }: IContext,
  ) {
    const filter: { contentType: string; contentTypeId?: string } = {
      contentType,
    };

    if (contentTypeId) {
      filter.contentTypeId = contentTypeId;
    }

    return await models.InternalNotes.find(filter)
      .sort({
        createdAt: 1,
      })
      .lean();
  },

  async internalNotesByAction(
    _parent: undefined,
    { contentType, pipelineId, page = 1, perPage = 10 }: IInternalNoteParams,
    { models }: IContext,
  ) {
    const [pluginName, moduleName] = contentType.split(':');

    const contentIds = await sendTRPCMessage({
      pluginName,
      method: 'query',
      module: moduleName,
      action: 'contentIds',
      input: {
        pipelineId,
      },
      defaultValue: [],
    });

    let totalCount = 0;

    const filter = { contentTypeId: { $in: contentIds } };

    const list: any[] = [];

    const internalNotes = await models.InternalNotes.find(filter)
      .sort({
        createdAt: -1,
      })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .lean();

    for (const note of internalNotes) {
      list.push({
        _id: note._id,
        action: 'addNote',
        contentType: note.contentType,
        contentId: note.contentTypeId,
        createdAt: note.createdAt,
        createdBy: note.createdUserId,
        content: note.content,
      });
    }

    totalCount = await models.InternalNotes.countDocuments(filter);

    return { list, totalCount };
  },

  async internalNotesAsLogs(
    _parent: undefined,
    { contentTypeId }: { contentTypeId: string },
    { models }: IContext,
  ) {
    const notes = await models.InternalNotes.find({ contentTypeId })
      .sort({ createdAt: -1 })
      .lean();

    // convert to activityLog schema
    return notes.map((n) => ({
      ...n,
      contentId: contentTypeId,
      contentType: 'note',
    }));
  },
};
