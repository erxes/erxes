import { IAppModel, loadAppClass } from '@/apps/db/models/Apps';
import {
  IConformityModel,
  loadConformityClass,
} from '@/conformities/db/models/Conformities';
import {
  ICompanyModel,
  loadCompanyClass,
} from '@/contacts/db/models/Companies';
import {
  ICustomerModel,
  loadCustomerClass,
} from '@/contacts/db/models/Customers';
import { IExchangeRateDocument } from '@/exchangeRates/@types/exchangeRate';
import {
  IExchangeRateModel,
  loadExchangeRateClass,
} from '@/exchangeRates/db/models/ExchangeRates';
import {
  IBrandModel,
  loadBrandClass,
} from '@/organization/brand/db/models/Brands';
import { IFavoritesDocument } from '@/organization/settings/db/definitions/favorites';
import {
  IFavoritesModel,
  loadFavoritesClass,
} from '@/organization/settings/db/models/Favorites';
import {
  IBranchDocument,
  IDepartmentDocument,
  IPositionDocument,
  IStructureDocument,
  IUnitDocument,
} from '@/organization/structure/@types/structure';
import {
  IBranchModel,
  IDepartmentModel,
  IPositionModel,
  IStructureModel,
  IUnitModel,
  loadBranchClass,
  loadDepartmentClass,
  loadPositionClass,
  loadStructureClass,
  loadUnitClass,
} from '@/organization/structure/db/models/Structure';
import {
  IUserModel,
  IUserMovemmentModel,
  loadUserClass,
  loadUserMovemmentClass,
} from '@/organization/team-member/db/models/Users';
import {
  IProductCategoryModel,
  loadProductCategoryClass,
} from '@/products/db/models/Categories';
import {
  IProductsConfigModel,
  loadProductsConfigClass,
} from '@/products/db/models/Configs';
import { IProductModel, loadProductClass } from '@/products/db/models/Products';
import { IUomModel, loadUomClass } from '@/products/db/models/Uoms';
import {
  IRelationModel,
  loadRelationClass,
} from '@/relations/db/models/Relations';
import { ITagModel, loadTagClass } from '@/tags/db/models/Tags';
import {
  IAppDocument,
  IBrandDocument,
  ICompanyDocument,
  ICustomerDocument,
  ILogDocument,
  IMainContext,
  IPermissionDocument,
  IProductCategoryDocument,
  IProductDocument,
  IProductsConfigDocument,
  IRelationDocument,
  IRoleDocument,
  ITagDocument,
  IUomDocument,
  IUserDocument,
  IUserGroupDocument,
  IUserMovementDocument,
} from 'erxes-api-shared/core-types';
import { createGenerateModels } from 'erxes-api-shared/utils';
import mongoose, { Model } from 'mongoose';
import {
  IDocumentModel,
  loadDocumentClass,
} from '~/modules/documents/db/models/Documents';
import { IDocumentDocument } from '~/modules/documents/types';
import { IConfigDocument } from '~/modules/organization/settings/db/definitions/configs';
import {
  IConfigModel,
  loadConfigClass,
} from '~/modules/organization/settings/db/models/Configs';
import {
  IPermissionModel,
  loadPermissionClass,
} from '~/modules/permissions/db/models/Permissions';
import {
  IUserGroupModel,
  loadUserGroupClass,
} from '~/modules/permissions/db/models/UserGroups';
import { IConformityDocument } from './modules/conformities/db/definitions/conformities';
import {
  IFieldDocument,
  IFieldGroupDocument,
} from './modules/forms/db/definitions/fields';
import {
  IForm,
  IFormSubmissionDocument,
} from './modules/forms/db/definitions/forms';
import {
  IFieldGroupModel,
  IFieldModel,
  loadFieldClass,
  loadGroupClass,
} from './modules/forms/db/models/Fields';
import {
  IFormModel,
  IFormSubmissionModel,
  loadFormClass,
  loadFormSubmissionClass,
} from './modules/forms/db/models/Forms';
import { ISegmentDocument } from './modules/segments/db/definitions/segments';
import {
  ISegmentModel,
  loadSegmentClass,
} from './modules/segments/db/models/Segments';

import {
  IInternalNoteModel,
  loadInternalNoteClass,
} from '@/internalNote/db/models/InternalNote';
import { IInternalNoteDocument } from '@/internalNote/types';
import { ILogModel, loadLogsClass } from '@/logs/db/models/Logs';

import {
  emailDeliverySchema,
  IAutomationDocument,
  IAutomationExecutionDocument,
  IEmailDeliveryDocument,
  INotificationDocument,
  notificationSchema,
} from 'erxes-api-shared/core-modules';
import {
  IRoleModel,
  loadRoleClass,
} from '~/modules/permissions/db/models/Roles';
import {
  IAutomationModel,
  loadClass as loadAutomationClass,
} from './modules/automations/db/models/Automations';
import {
  IExecutionModel,
  loadClass as loadExecutionClass,
} from './modules/automations/db/models/Executions';

export interface IModels {
  Brands: IBrandModel;
  Customers: ICustomerModel;
  Companies: ICompanyModel;
  Users: IUserModel;
  UserMovements: IUserMovemmentModel;
  Configs: IConfigModel;
  Permissions: IPermissionModel;
  UsersGroups: IUserGroupModel;
  Roles: IRoleModel;
  Tags: ITagModel;
  InternalNotes: IInternalNoteModel;
  Products: IProductModel;
  ProductCategories: IProductCategoryModel;
  ProductsConfigs: IProductsConfigModel;
  Uoms: IUomModel;
  Structures: IStructureModel;
  Departments: IDepartmentModel;
  Units: IUnitModel;
  Branches: IBranchModel;
  Positions: IPositionModel;
  Apps: IAppModel;
  Fields: IFieldModel;
  FieldsGroups: IFieldGroupModel;
  Forms: IFormModel;
  FormSubmissions: IFormSubmissionModel;
  Segments: ISegmentModel;
  Conformities: IConformityModel;
  Relations: IRelationModel;
  Favorites: IFavoritesModel;
  ExchangeRates: IExchangeRateModel;
  Documents: IDocumentModel;
  Automations: IAutomationModel;
  AutomationExecutions: IExecutionModel;
  Logs: ILogModel;
  Notifications: Model<INotificationDocument>;
  EmailDeliveries: Model<IEmailDeliveryDocument>;
}

export interface IContext extends IMainContext {
  models: IModels;
  commonQuerySelector: any;
  subdomain: string;
}

export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string,
): IModels => {
  const models = {} as IModels;

  models.Users = db.model<IUserDocument, IUserModel>(
    'users',
    loadUserClass(models, subdomain),
  );

  models.Brands = db.model<IBrandDocument, IBrandModel>(
    'brands',
    loadBrandClass(models),
  );

  models.Conformities = db.model<IConformityDocument, IConformityModel>(
    'conformity',
    loadConformityClass(models),
  );

  models.Customers = db.model<ICustomerDocument, ICustomerModel>(
    'customers',
    loadCustomerClass(models),
  );

  models.Companies = db.model<ICompanyDocument, ICompanyModel>(
    'companies',
    loadCompanyClass(models),
  );

  models.UserMovements = db.model<IUserMovementDocument, IUserMovemmentModel>(
    'user_movements',
    loadUserMovemmentClass(models, subdomain),
  );

  models.Configs = db.model<IConfigDocument, IConfigModel>(
    'configs',
    loadConfigClass(models),
  );

  models.Permissions = db.model<IPermissionDocument, IPermissionModel>(
    'permissions',
    loadPermissionClass(models),
  );

  models.Roles = db.model<IRoleDocument, IRoleModel>(
    'roles',
    loadRoleClass(models),
  );

  models.UsersGroups = db.model<IUserGroupDocument, IUserGroupModel>(
    'user_groups',
    loadUserGroupClass(models),
  );

  models.Tags = db.model<ITagDocument, ITagModel>('tags', loadTagClass(models));

  models.InternalNotes = db.model<IInternalNoteDocument, IInternalNoteModel>(
    'internal_notes',
    loadInternalNoteClass(models),
  );

  models.Products = db.model<IProductDocument, IProductModel>(
    'products',
    loadProductClass(models),
  );

  models.Uoms = db.model<IUomDocument, IUomModel>('uoms', loadUomClass(models));

  models.ProductsConfigs = db.model<
    IProductsConfigDocument,
    IProductsConfigModel
  >('products_configs', loadProductsConfigClass(models));

  models.ProductCategories = db.model<
    IProductCategoryDocument,
    IProductCategoryModel
  >('product_categories', loadProductCategoryClass(models));

  models.Structures = db.model<IStructureDocument, IStructureModel>(
    'structures',
    loadStructureClass(models),
  );
  models.Departments = db.model<IDepartmentDocument, IDepartmentModel>(
    'departments',
    loadDepartmentClass(models),
  );
  models.Units = db.model<IUnitDocument, IUnitModel>(
    'units',
    loadUnitClass(models),
  );
  models.Branches = db.model<IBranchDocument, IBranchModel>(
    'branches',
    loadBranchClass(models),
  );
  models.Positions = db.model<IPositionDocument, IPositionModel>(
    'positions',
    loadPositionClass(models),
  );
  models.Apps = db.model<IAppDocument, IAppModel>('apps', loadAppClass(models));

  models.Fields = db.model<IFieldDocument, IFieldModel>(
    'form_fields',
    loadFieldClass(models, subdomain),
  );
  models.FieldsGroups = db.model<IFieldGroupDocument, IFieldGroupModel>(
    'fields_groups',
    loadGroupClass(models),
  );
  models.Forms = db.model<IForm, IFormModel>('forms', loadFormClass(models));
  models.FormSubmissions = db.model<
    IFormSubmissionDocument,
    IFormSubmissionModel
  >('form_submissions', loadFormSubmissionClass(models));

  models.Segments = db.model<ISegmentDocument, ISegmentModel>(
    'segments',
    loadSegmentClass(models),
  );

  models.Relations = db.model<IRelationDocument, IRelationModel>(
    'relations',
    loadRelationClass(models),
  );

  models.Favorites = db.model<IFavoritesDocument, IFavoritesModel>(
    'favorites',
    loadFavoritesClass(models),
  );

  models.ExchangeRates = db.model<IExchangeRateDocument, IExchangeRateModel>(
    'exchange_rates',
    loadExchangeRateClass(models, subdomain),
  );

  models.Documents = db.model<IDocumentDocument, IDocumentModel>(
    'documents',
    loadDocumentClass(models, subdomain),
  );

  models.Automations = db.model<IAutomationDocument, IAutomationModel>(
    'automations',
    loadAutomationClass(models),
  );

  models.AutomationExecutions = db.model<
    IAutomationExecutionDocument,
    IExecutionModel
  >('automations_executions', loadExecutionClass(models));

  models.Notifications = db.model<
    INotificationDocument,
    Model<INotificationDocument>
  >('notifications', notificationSchema);

  models.EmailDeliveries = db.model<
    IEmailDeliveryDocument,
    Model<IEmailDeliveryDocument>
  >('email_deliveries', emailDeliverySchema);

  const db_name = db.name;

  const logDb = db.useDb(`${db_name}_logs`);

  models.Logs = logDb.model<ILogDocument, ILogModel>(
    'logs',
    loadLogsClass(models),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses, {
  ignoreModels: ['logs', 'automations_executions'],
});
