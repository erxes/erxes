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
  IForm,
  IFormSubmissionDocument,
} from './modules/forms/db/definitions/forms';
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
  AiAgentDocument,
  aiAgentSchema,
  aiEmbeddingSchema,
  IAiEmbeddingDocument,
  IAutomationDocument,
  IAutomationExecutionDocument,
  IEmailDeliveryDocument,
  INotificationDocument,
  notificationSchema,
} from 'erxes-api-shared/core-modules';
import { IAutomationEmailTemplateDocument } from 'erxes-api-shared/core-types';
import {
  IRoleModel,
  loadRoleClass,
} from '~/modules/permissions/db/models/Roles';
import {
  IAutomationEmailTemplateModel,
  loadAutomationEmailTemplateClass,
} from './modules/automations/db/models/AutomationEmailTemplates';
import {
  IAutomationModel,
  loadClass as loadAutomationClass,
} from './modules/automations/db/models/Automations';
import {
  IExecutionModel,
  loadClass as loadExecutionClass,
} from './modules/automations/db/models/Executions';
import {
  IDeliveryReportModel,
  IStatsModel,
  loadStatsClass,
} from './modules/broadcast/db/models/DeliveryReports';
import {
  IEngageMessageModel,
  loadEngageMessageClass,
} from './modules/broadcast/db/models/Engages';
import {
  ISmsRequestModel,
  loadSmsRequestClass,
} from './modules/broadcast/db/models/SmsRequests';

import {
  IFieldModel,
  loadFieldClass,
} from './modules/properties/db/models/Field';

import {
  IFieldGroupModel,
  loadFieldGroupClass,
} from './modules/properties/db/models/Group';

import {
  IDeliveryReportsDocument,
  IEngageMessageDocument,
  ISmsRequestDocument,
  IStatsDocument,
} from './modules/broadcast/@types';
import { deliveryReportsSchema } from './modules/broadcast/db/definitions/deliveryReports';
import {
  ICPUserModel,
  loadCPUserClass,
} from './modules/clientportal/db/models/CPUser';
import {
  IClientPortalModel,
  loadClientPortalClass,
} from './modules/clientportal/db/models/ClientPortal';
import { IClientPortalDocument } from './modules/clientportal/types/clientPortal';
import { ICPUserDocument } from './modules/clientportal/types/cpUser';
import { IEmailDeliveryModel, loadEmailDeliveryClass } from './modules/organization/team-member/db/models/EmailDeliveries';
import {
  IFieldDocument,
  IFieldGroupDocument,
} from './modules/properties/@types';
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
  AutomationEmailTemplates: IAutomationEmailTemplateModel;
  Logs: ILogModel;
  Notifications: Model<INotificationDocument>;
  EmailDeliveries: IEmailDeliveryModel;
  ClientPortal: IClientPortalModel;
  CPUser: ICPUserModel;
  AiAgents: Model<AiAgentDocument>;
  AiEmbeddings: Model<IAiEmbeddingDocument>;
  EngageMessages: IEngageMessageModel;
  Stats: IStatsModel;
  SmsRequests: ISmsRequestModel;
  DeliveryReports: IDeliveryReportModel;
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
    'properties_fields',
    loadFieldClass(models),
  );

  models.FieldsGroups = db.model<IFieldGroupDocument, IFieldGroupModel>(
    'properties_groups',
    loadFieldGroupClass(models),
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

  models.AutomationEmailTemplates = db.model<
    IAutomationEmailTemplateDocument,
    IAutomationEmailTemplateModel
  >('automation_email_templates', loadAutomationEmailTemplateClass(models));

  models.Notifications = db.model<
    INotificationDocument,
    Model<INotificationDocument>
  >('notifications', notificationSchema);

  models.EmailDeliveries = db.model<
    IEmailDeliveryDocument,
    IEmailDeliveryModel
  >('email_deliveries', loadEmailDeliveryClass(models));

  models.AiAgents = db.model<AiAgentDocument, Model<AiAgentDocument>>(
    'automations_ai_agents',
    aiAgentSchema,
  );

  models.AiEmbeddings = db.model<
    IAiEmbeddingDocument,
    Model<IAiEmbeddingDocument>
  >('ai_embeddings', aiEmbeddingSchema);

  models.EngageMessages = db.model<IEngageMessageDocument, IEngageMessageModel>(
    'engage_messages',
    loadEngageMessageClass(models, subdomain),
  );

  models.DeliveryReports = db.model<
    IDeliveryReportsDocument,
    IDeliveryReportModel
  >('delivery_reports', deliveryReportsSchema);

  models.Stats = db.model<IStatsDocument, IStatsModel>(
    'engage_stats',
    loadStatsClass(models),
  );

  models.SmsRequests = db.model<ISmsRequestDocument, ISmsRequestModel>(
    'engage_sms_requests',
    loadSmsRequestClass(models),
  );

  const db_name = db.name;

  const logDb = db.useDb(`${db_name}_logs`);

  models.Logs = logDb.model<ILogDocument, ILogModel>(
    'logs',
    loadLogsClass(models),
  );

  models.ClientPortal = db.model<IClientPortalDocument, IClientPortalModel>(
    'client_portals',
    loadClientPortalClass(models),
  );

  models.CPUser = db.model<ICPUserDocument, ICPUserModel>(
    'client_portal_users',
    loadCPUserClass(models),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses, {
  ignoreModels: ['logs', 'automations_executions'],
});
