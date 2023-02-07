import { Document, Schema, Model, Connection, Types } from 'mongoose';
import { IModels } from './index';
import * as _ from 'lodash';

export interface IPage {
  _id: any;
  code?: string | null;
  content?: string | null;
  description?: string | null;
  title?: string | null;
  thumbnail?: string | null;
  listOrder?: number | null;

  custom: any;
  customIndexed: any;
}

export type PageDocument = IPage & Document;

const OMIT_FROM_INPUT = ['_id'] as const;

export type PageCreateInput = Omit<IPage, typeof OMIT_FROM_INPUT[number]>;
export type PagePatchInput = PageCreateInput;

export interface IPageModel extends Model<PageDocument> {
  findByIdOrThrow(_id: string): Promise<PageDocument>;
  createPage(input: PageCreateInput): Promise<PageDocument>;
  patchPage(_id: string, patch: PagePatchInput): Promise<PageDocument>;
  deletePage(_id: string): Promise<PageDocument>;
}

export const pageSchema = new Schema<PageDocument>({
  code: String,
  content: String,
  description: String,
  title: String,
  thumbnail: String,
  custom: Schema.Types.Mixed,
  customIndexed: Schema.Types.Mixed,
  listOrder: Number
});
pageSchema.index({ code: 1 });

export const generatePageModel = (
  subdomain: string,
  con: Connection,
  models: IModels
): void => {
  class PageModelStatics {
    public static async findByIdOrThrow(_id: string): Promise<PageDocument> {
      const page = await models.Page.findById(_id);
      if (!page) {
        throw new Error(`Page with _id = ${_id} doesn't exist`);
      }
      return page;
    }
    public static async createPage(
      input: PageCreateInput
    ): Promise<PageDocument> {
      return models.Page.create(input);
    }
    public static async patchPage(
      _id: string,
      patch: PagePatchInput
    ): Promise<PageDocument> {
      const page = await models.Page.findByIdAndUpdate(
        _id,
        { $set: patch },
        { new: true }
      );

      if (!page) {
        throw new Error(`Page with _id = ${_id} doesn't exist`);
      }
      return page;
    }
    public static async deletePage(_id: string): Promise<PageDocument> {
      const page = await models.Page.findByIdOrThrow(_id);
      await page.remove();
      return page;
    }
  }
  pageSchema.loadClass(PageModelStatics);

  models.Page = con.model<PageDocument, IPageModel>('forum_pages', pageSchema);
  // creating wildcard index on the schema doesn't work
  models.Page.collection.createIndex({ 'customIndexed.$**': 1 });
};
