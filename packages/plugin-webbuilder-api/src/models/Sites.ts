import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { ISite, ISiteDocument, siteSchema } from './definitions/sites';

export interface ISiteModel extends Model<ISiteDocument> {
  checkDuplication(doc: ISite, _id?: string): void;
  getSite(_id: string): Promise<ISiteDocument>;
  createSite(doc: ISite, userId: string): Promise<ISiteDocument>;
  updateSite(_id: string, doc: ISite, userId: string): Promise<ISiteDocument>;
  removeSite(_id: string): Promise<ISiteDocument>;
  duplicateSite(_id: string, userId: string): Promise<ISiteDocument>;
}

export const loadSiteClass = (models: IModels) => {
  class Site {
    public static async checkDuplication({ name }: ISite, _id?: string) {
      const query: any = {};

      let previousEntry;

      if (_id) {
        query._id = { $ne: _id };
      }

      if (name) {
        previousEntry = await models.Sites.findOne({ ...query, name });

        if (previousEntry) {
          throw new Error('Name duplicated!');
        }
      }
    }

    public static async getSite(_id: string) {
      const site = await models.Sites.findOne({ _id }, { _id: 0 }).lean();

      if (!site) {
        throw new Error('Site not found');
      }

      return site;
    }

    public static async createSite(doc, userId: string) {
      await this.checkDuplication(doc);

      return models.Sites.create({
        ...doc,

        createdAt: new Date(),
        createdBy: userId
      });
    }

    public static async updateSite(_id: string, doc: ISite, userId: string) {
      await this.checkDuplication(doc, _id);

      await models.Sites.updateOne(
        { _id },
        { $set: { ...doc, modifiedAt: new Date(), modifiedBy: userId } }
      );

      return models.Sites.findOne({ _id });
    }

    public static async removeSite(_id) {
      // remove site pages
      await models.Pages.deleteMany({
        siteId: _id
      });

      const contentTypes = await models.ContentTypes.find({ siteId: _id });

      // remove site contentTypes
      for (const type of contentTypes) {
        await models.ContentTypes.removeContentType(type._id);
      }

      return models.Sites.deleteOne({
        _id
      });
    }

    public static async duplicateSite(_id: string, userId: string) {
      // get old site
      const site = await models.Sites.getSite(_id);

      // create new site
      const newSite = await models.Sites.createSite(
        {
          ...site,
          name: `${site.name} copy`
        },
        userId
      );

      // get old site pages
      const pages = await models.Pages.find(
        {
          siteId: _id
        },
        {
          _id: 0
        }
      ).lean();

      // get old site contentTypes
      const contentTypes = await models.ContentTypes.find({
        siteId: _id
      }).lean();

      // create new site content types and entries
      for (const contentType of contentTypes) {
        const entries = await models.Entries.find(
          {
            contentTypeId: contentType._id
          },
          { _id: 0 }
        );

        // duplicate contentType
        const newContentType = await models.ContentTypes.createContentType(
          {
            code: contentType.code,
            displayName: contentType.displayName,
            fields: contentType.fields,

            siteId: newSite._id
          },
          userId
        );

        // duplicate entries
        for (const entry of entries) {
          await models.Entries.createEntry(
            {
              ...entry,
              values: entry.values,
              contentTypeId: newContentType._id
            },
            userId
          );
        }
      }

      // duplicate site pages
      for (const page of pages) {
        await models.Pages.create({
          ...page,
          siteId: newSite._id
        });
      }

      return newSite;
    }
  }

  siteSchema.loadClass(Site);

  return siteSchema;
};
