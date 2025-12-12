import { ITemplate, ITemplateCategory } from '../db/definitions/template';

export type TemplateInput = Omit<
  ITemplate,
  '_id' | 'createdAt' | 'updatedAt' | 'status' | 'createdBy' | 'updatedBy'
>;

export type TemplateCategoryInput = Omit<
  ITemplateCategory,
  '_id' | 'createdAt' | 'updatedAt' | 'status' | 'createdBy' | 'updatedBy'
>;