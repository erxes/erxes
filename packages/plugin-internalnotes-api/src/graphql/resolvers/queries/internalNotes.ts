import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';

import { InternalNotes } from '../../../models';
import { getContentIds } from '../../../messageBroker';

interface IParams {
  contentType: string;
  pipelineId: string;
  perPage?: number;
  page?: number;
}

interface INoteAsLogParams {
  contentTypeId: string;
}

const internalNoteQueries = {
  async internalNoteDetail(_root, { _id }: { _id: string }) {
    return InternalNotes.findOne({ _id });
  },
  /**
   * InternalNotes list
   */
  internalNotes(
    _root,
    {
      contentType,
      contentTypeId,
    }: { contentType: string; contentTypeId: string }
  ) {
    return InternalNotes.find({ contentType, contentTypeId }).sort({
      createdDate: 1,
    });
  },
  async internalNotesByAction(
    _root,
    { contentType, pipelineId, page = 1, perPage = 10 }: IParams
  ) {
    const contentIds = await getContentIds({ pipelineId, contentType });

    let totalCount = 0;
    const filter = { contentTypeId: { $in: contentIds } };
    const list: any[] = [];

    const internalNotes = await InternalNotes.find(filter)
      .sort({
        createdAt: -1,
      })
      .skip(perPage * (page - 1))
      .limit(perPage);

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

    totalCount = await InternalNotes.countDocuments(filter);

    return { list, totalCount };
  },
  async internalNotesAsLogs(_root, { contentTypeId }: INoteAsLogParams) {
    const notes = await InternalNotes.find({ contentTypeId }).sort({ createdAt: -1 }).lean();

    // convert to activityLog schema
    return notes.map(n => ({
      ...n,
      contentId: contentTypeId,
      contentType: 'note'
    }));
  }
};

moduleRequireLogin(internalNoteQueries);

export default internalNoteQueries;
