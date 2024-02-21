import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { sendCardsMessage } from '../messageBroker';
import {
  sectionSchema,
  ISection,
  ISectionDocument,
} from './definitions/insight';
import { CONTRIBUTIONTYPE, TEAMGOALTYPE } from '../constants';

export interface ISectionModel extends Model<ISectionDocument> {
  getSection(_id: string): Promise<ISectionDocument>;
  createSection(doc: ISection): Promise<ISectionDocument>;
  removeSection(_id: string): Promise<ISectionDocument>;
}

export const loadSectionClass = (models: IModels, subdomain: string) => {
  class Section {
    public static async createSection(doc: ISection) {
      return models.Sections.create(doc);
    }

    public static async getSection(_id: string) {
      const section = await models.Sections.findOne({
        _id,
      });

      if (!section) {
        throw new Error('Section not found');
      }
      return section;
    }

    public static async removeSection(_id: string) {
      const section = await models.Sections.findOne({
        _id,
      });

      if (!section) {
        throw new Error('Section not found');
      }

      return models.Sections.deleteOne({ _id });
    }
  }

  sectionSchema.loadClass(Section);

  return sectionSchema;
};
