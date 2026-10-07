import { documentPlaceholderResolver } from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { DocumentAccessUser } from './types';

/**
 * Both editors leave the same `{{ document.<id> }}` marker for an embedded
 * document, because a document is rendered per record and an email body is
 * written once.
 */
export const documentResolver = ({
  models,
  replacerIds = [],
  user,
}: {
  models: IModels;
  replacerIds?: string[];
  user?: DocumentAccessUser;
}) =>
  documentPlaceholderResolver({
    print: (documentId) =>
      models.Documents.processDocument({
        _id: documentId,
        replacerIds,
        config: {},
        user,
      }),
    findContent: async (documentId) =>
      (await models.Documents.findOne({ _id: documentId }).lean())?.content,
  });
