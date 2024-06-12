import * as mongoose from 'mongoose';
import { ITemplateModal, loadTemplateClass } from './models/Templates';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import { TemplateCategoryDocument, TemplateDocument } from './models/definitions/templates';
import { ITemplateCategoryModal, loadTemplateCategoryClass } from './models/Category';

export interface IModels {
    Templates: ITemplateModal;
    TemplateCategories: ITemplateCategoryModal
}
export interface IContext extends IMainContext {
    subdomain: string;
    models: IModels;
    serverTiming: any;
}

export const loadClasses = (db: mongoose.Connection): IModels => {
    const models = {} as IModels;

    models.Templates = db.model<TemplateDocument, ITemplateModal>('templates', loadTemplateClass(models));
    models.TemplateCategories = db.model<TemplateCategoryDocument, ITemplateCategoryModal>('template_categories', loadTemplateCategoryClass(models));

    return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
