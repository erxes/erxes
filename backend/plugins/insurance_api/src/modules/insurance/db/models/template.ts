import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { ITemplateDocument } from '@/insurance/@types/template';
import { templateSchema } from '@/insurance/db/definitions/contractTemplates';

export type ITemplateModel = Model<ITemplateDocument>;

export const loadTemplateClass = (models: IModels) => {
  class Template {}

  templateSchema.loadClass(Template);

  // Drop old insuranceType index if it exists (migration)
  if (models.Template) {
    models.Template.collection.dropIndex('insuranceType_1').catch(() => {
      // Index doesn't exist, ignore error
    });
  }

  return templateSchema;
};
