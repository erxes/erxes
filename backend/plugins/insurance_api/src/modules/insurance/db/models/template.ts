import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { ITemplateDocument } from '@/insurance/@types/template';
import { templateSchema } from '@/insurance/db/definitions/contractTemplates';

export type ITemplateModel = Model<ITemplateDocument>;

export const loadTemplateClass = (_models: IModels) => {
  void _models;
  class Template {}

  templateSchema.loadClass(Template);

  return templateSchema;
};
