import { APPROVAL_LOCK_STATUSES } from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { FilterQuery, Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { documents } from '~/meta/documents';
import {
  DOCUMENT_APPROVAL_CONTENT_TYPE,
  DocumentAccessUser,
  DocumentReadInput,
  DocumentSaveInput,
  DocumentProcessInput,
  IDocumentDocument,
} from '~/modules/documents/types';
import { prepareContent } from '~/modules/documents/utils';
import { documentSchema } from '../definitions/documents';
export interface IDocumentModel extends Model<IDocumentDocument> {
  getAccessFilter(
    user?: DocumentAccessUser,
  ): Promise<FilterQuery<IDocumentDocument>>;
  getDocument(input: DocumentReadInput): Promise<IDocumentDocument>;
  saveDocument(input: DocumentSaveInput): Promise<IDocumentDocument>;
  processDocument(input: DocumentProcessInput): Promise<string>;
}

export const loadDocumentClass = (models: IModels, subdomain: string) => {
  class Document {
    public static async getAccessFilter(
      user: DocumentAccessUser = { _id: '' },
    ): Promise<FilterQuery<IDocumentDocument>> {
      const locks = await models.ApprovalLocks.find({
        contentType: DOCUMENT_APPROVAL_CONTENT_TYPE,
        status: APPROVAL_LOCK_STATUSES.ACTIVE,
      })
        .select('contentId')
        .lean();

      if (!locks.length) return {};

      const documents = await models.Documents.find({
        _id: { $in: locks.map((lock) => lock.contentId) },
      })
        .select('_id createdUserId')
        .lean();
      const states = await models.ApprovalLocks.getStates({
        user,
        contentType: DOCUMENT_APPROVAL_CONTENT_TYPE,
        contentIds: documents.map((document) => document._id),
        ownerIdsByContentId: Object.fromEntries(
          documents.map((document) => [document._id, document.createdUserId]),
        ),
        action: 'view',
      });

      return {
        _id: {
          $nin: states
            .filter((state) => !state.hasAccess)
            .map((state) => state.contentId),
        },
      };
    }

    public static async getDocument({
      _id,
      user = { _id: '' },
      action = 'view',
    }: DocumentReadInput): Promise<IDocumentDocument> {
      const document = await models.Documents.findOne({ _id });

      if (!document) {
        throw new Error('Document not found');
      }

      await models.ApprovalLocks.assertAccess({
        user,
        contentType: DOCUMENT_APPROVAL_CONTENT_TYPE,
        contentId: document._id,
        ownerId: document.createdUserId,
        action,
      });

      return document;
    }

    public static async saveDocument({ _id, doc, user }: DocumentSaveInput) {
      if (_id) {
        const document = await models.Documents.getDocument({
          _id,
          user,
          action: 'edit',
        });

        return await models.Documents.findOneAndUpdate(
          { _id: document._id },
          { $set: { ...doc, createdUserId: document.createdUserId } },
          { new: true },
        );
      }

      return await models.Documents.create(doc);
    }

    public static async processDocument({
      user,
      ...doc
    }: DocumentProcessInput) {
      const { _id, config } = doc;

      const document = await models.Documents.getDocument({ _id, user });
      const { content, contentType } = document;

      const [pluginName, moduleName] = contentType.split(':');

      if (pluginName === 'core') {
        const replaceContent = documents.replaceContent;

        const replacedContents = await replaceContent({
          subdomain,
          data: {
            ...(doc || {}),
            replacerIds: doc.replacerIds || [],
            config: config || {},
            content,
            contentType: document.contentType,
          },
        });

        return prepareContent({
          contents: replacedContents,
          config: config || {},
        });
      }

      const replacedContents = await sendTRPCMessage({
        subdomain,

        pluginName,
        method: 'query',
        module: moduleName,
        action: 'replaceContent',
        input: {
          ...(doc || {}),
          content,
          contentType: document.contentType,
        },
        defaultValue: [],
      });

      return prepareContent({
        contents: replacedContents,
        config: config || {},
      });
    }
  }

  documentSchema.loadClass(Document);

  return documentSchema;
};
