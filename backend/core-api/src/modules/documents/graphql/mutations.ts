import { IContext } from '~/connectionResolvers';
import { IDocument } from '../types';
import { z } from 'zod';
import { documentContentTypes } from '../contentTypes';

export const documentMutations = {
  documentsSave: async (
    _parent: undefined,
    params: { _id?: string } & IDocument,
    { user, models, checkPermission }: IContext,
  ) => {
    await checkPermission('manageDocuments');

    const { _id, ...doc } = params;

    return await models.Documents.saveDocument({
      _id,
      doc: { ...doc, createdUserId: user._id },
      user,
    });
  },

  documentsDuplicate: async (
    _parent: undefined,
    input: { _id: string; contentType: string },
    { user, models, checkPermission }: IContext,
  ) => {
    await checkPermission('manageDocuments');
    await checkPermission('documentsRead');
    const { _id, contentType } = z
      .object({
        _id: z.string().min(1),
        contentType: z.string().regex(/^[a-zA-Z0-9]+:[a-zA-Z0-9_.]+$/),
      })
      .parse(input);
    const document = await models.Documents.getDocument({ _id, user });
    const sameContentType =
      documentContentTypes(document.contentType)[0] ===
      documentContentTypes(contentType)[0];

    return models.Documents.saveDocument({
      user,
      doc: {
        name: `${document.name} (copy)`,
        content: sameContentType ? document.content : '',
        replacer: sameContentType ? document.replacer : '',
        tagIds: document.tagIds,
        contentType,
        subType: sameContentType ? document.subType : '',
        createdUserId: user._id,
      },
    });
  },

  documentsRemove: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('removeDocuments');

    const document = await models.Documents.getDocument({
      _id,
      user,
      action: 'delete',
    });

    return await models.Documents.findOneAndDelete({ _id: document._id });
  },
};
