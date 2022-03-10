import { getSchemaLabels } from '@erxes/api-utils/src/logUtils';

import { generateModels } from "./connectionResolver";
import { internalNoteSchema } from './models/definitions/internalNotes';

export default {
  collectItems: async ({ contentId, subdomain }) => {
    const models = await generateModels(subdomain);
    const notes = await models.InternalNotes.find({
      contentTypeId: contentId,
    }).sort({ createdAt: -1 });
    const results: any[] = [];

    for (const note of notes) {
      results.push({
        _id: note._id,
        contentType: 'note',
        contentId,
        createdAt: note.createdAt,
      });
    }

    return {
      status: 'success',
      data: results,
    };
  },
  getSchemaLabels: ({ type }) => ({
    status: 'success',
    data: getSchemaLabels(type, [
      { name: 'internalNote', schemas: [internalNoteSchema] },
    ]),
  })
};
