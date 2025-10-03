import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { documents } from '~/meta/documents';
import { IDocumentDocument } from '~/modules/documents/types';
import { prepareContent } from '~/modules/documents/utils';
import { documentSchema } from '../definitions/documents';

export interface IDocumentModel extends Model<IDocumentDocument> {
  getDocument({ _id }): Promise<IDocumentDocument>;
  saveDocument({ _id, doc }): Promise<IDocumentDocument>;
  processDocument({ _id, replacerIds, config }): Promise<IDocumentDocument>;
}

export const loadDocumentClass = (models: IModels, subdomain: string) => {
  class Document {
    public static async getDocument({ _id }) {
      const document = await models.Documents.findOne({
        $or: [{ _id }, { code: _id }],
      }).lean();

      if (!document) {
        throw new Error('Document not found');
      }

      return document;
    }

    /**
     * Marks documents as read
     */
    public static async saveDocument({ _id, doc }) {
      if (_id) {
        return await models.Documents.findOneAndUpdate(
          { _id },
          { $set: doc },
          { new: true },
        );
      }

      return await models.Documents.create(doc);
    }

    public static async processDocument(doc) {
      const { _id, config } = doc;

      const document = await models.Documents.getDocument({ _id });

      const { content, contentType } = document;

      const [pluginName, moduleName] = contentType.split(':');

      if (pluginName === 'core') {
        const replaceContent = documents.replaceContent;

        const replacedContents = await replaceContent({
          subdomain,
          data: {
            ...(doc || {}),
            content,
            contentType: document.contentType,
          },
        });

        return prepareContent({
          contents: replacedContents,
          config,
        });
      }

      const replacedContents = await sendTRPCMessage({
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
        config,
      });
    }
  }

  documentSchema.loadClass(Document);

  return documentSchema;
};
