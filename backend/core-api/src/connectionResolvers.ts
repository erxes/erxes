import { IAppModel, loadAppClass } from '@/apps/db/models/Apps';
import { IBundleConditionDocument, IBundleRuleDocument } from '@/bundle/@types';
import {
  IBundleConditionModel,
  loadBundleConditionClass,
} from '@/bundle/db/models/BundleConditions';
import {
  IBundleRuleModel,
  loadBundleRuleClass,
} from '@/bundle/db/models/BundleRules';
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
  IInternalNoteModel,
  loadInternalNoteClass,
} from '@/internalNote/db/models/InternalNote';
import { IInternalNoteDocument } from '@/internalNote/types';
import { ILogModel, loadLogsClass } from '@/logs/db/models/Logs';
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
import { IProductRuleDocument } from '@/products/@types/rule';
import {
  IProductCategoryModel,
  loadProductCategoryClass,
} from '@/products/db/models/Categories';
import {
  IProductsConfigModel,
  loadProductsConfigClass,
} from '@/products/db/models/Configs';
import { IProductModel, loadProductClass } from '@/products/db/models/Products';
import {
  IProductRuleModel,
  loadProductRuleClass,
} from '@/products/db/models/Rules';
import { IUomModel, loadUomClass } from '@/products/db/models/Uoms';
import {
  IRelationModel,
  loadRelationClass,
} from '@/relations/db/models/Relations';
import { ITagModel, loadTagClass } from '@/tags/db/models/Tags';
import {
  activityLogsSchema,
  AiAgentDocument,
  aiAgentSchema,
  aiEmbeddingSchema,
  IActivityLogDocument,
  IAiEmbeddingDocument,
  IAutomationDocument,
  IAutomationExecutionDocument,
  IEmailDeliveryDocument,
  INotificationDocument,
  notificationSchema,
} from 'erxes-api-shared/core-modules';
import {
  IAppDocument,
  IAutomationEmailTemplateDocument,
  IBrandDocument,
  ICompanyDocument,
  ICustomerDocument,
  ILogDocument,
  IMainContext,
  IProductCategoryDocument,
  IProductDocument,
  IProductsConfigDocument,
  IRelationDocument,
  ITagDocument,
  IUomDocument,
  IUserDocument,
  IUserMovementDocument,
  IPermissionGroupDocument,
} from 'erxes-api-shared/core-types';

import { createGenerateModels } from 'erxes-api-shared/utils';
import mongoose, { Document, Model } from 'mongoose';
import {
  IDocumentModel,
  loadDocumentClass,
} from '~/modules/documents/db/models/Documents';
import { IDocumentDocument } from '~/modules/documents/types';
import {
  IExportDocument,
  IExportModel,
  loadExportClass,
} from '~/modules/import-export/db/models/Exports';
import {
  IImportDocument,
  IImportModel,
  loadImportClass,
} from '~/modules/import-export/db/models/Imports';
import { IConfigDocument } from '~/modules/organization/settings/db/definitions/configs';
import {
  IConfigModel,
  loadConfigClass,
} from '~/modules/organization/settings/db/models/Configs';

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
  IDeliveryReportsDocument,
  IEngageMessageDocument,
  ISmsRequestDocument,
  IStatsDocument,
} from './modules/broadcast/@types';
import { deliveryReportsSchema } from './modules/broadcast/db/definitions/deliveryReports';
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
  ICPNotificationModel,
  loadCPNotificationClass,
} from './modules/clientportal/db/models/CPNotification';
import {
  ICPUserModel,
  loadCPUserClass,
} from './modules/clientportal/db/models/CPUser';
import {
  IClientPortalModel,
  loadClientPortalClass,
} from './modules/clientportal/db/models/ClientPortal';
import {
  ICPCommentsModel,
  loadCommentClass,
} from './modules/clientportal/db/models/Comment';
import { IClientPortalDocument } from './modules/clientportal/types/clientPortal';
import { ICPCommentDocument } from './modules/clientportal/types/comment';
import { ICPUserDocument } from './modules/clientportal/types/cpUser';
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
import {
  IEmailDeliveryModel,
  loadEmailDeliveryClass,
} from './modules/organization/team-member/db/models/EmailDeliveries';
import { IOrgWhiteLabelDocument } from './modules/organization/whitelabel/@types/orgWhiteLabel';
import {
  IOrgWhiteLabelModel,
  loadOrgWhiteLabelClass,
} from './modules/organization/whitelabel/db/models/OrgWhiteLabel';
import {
  IFieldDocument,
  IFieldGroupDocument,
} from './modules/properties/@types';
import {
  IFieldModel,
  loadFieldClass,
} from './modules/properties/db/models/Field';
import {
  IFieldGroupModel,
  loadFieldGroupClass,
} from './modules/properties/db/models/Group';
import { ISegmentDocument } from './modules/segments/db/definitions/segments';
import {
  ISegmentModel,
  loadSegmentClass,
} from './modules/segments/db/models/Segments';

import { ICPNotificationDocument } from './modules/clientportal/types/cpNotification';

import {
  loadPermissionGroupClass,
  IPermissionGroupModel,
} from '@/permissions/db/models/Permissions';
export interface IModels {
  Brands: IBrandModel;
  Customers: ICustomerModel;
  Companies: ICompanyModel;
  Users: IUserModel;
  UserMovements: IUserMovemmentModel;
  Configs: IConfigModel;
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
  Imports: IImportModel;
  Exports: IExportModel;
  Notifications: Model<INotificationDocument>;
  EmailDeliveries: IEmailDeliveryModel;
  ClientPortal: IClientPortalModel;
  CPUser: ICPUserModel;
  CPComments: ICPCommentsModel;
  CPNotifications: ICPNotificationModel;

  AiAgents: Model<AiAgentDocument>;
  AiEmbeddings: Model<IAiEmbeddingDocument>;
  ActivityLogs: Model<IActivityLogDocument>;
  EngageMessages: IEngageMessageModel;
  Stats: IStatsModel;
  SmsRequests: ISmsRequestModel;
  DeliveryReports: IDeliveryReportModel;
  OrgWhiteLabel: IOrgWhiteLabelModel;

  BundleCondition: IBundleConditionModel;
  BundleRule: IBundleRuleModel;
  ProductRules: IProductRuleModel;
  PermissionGroups: IPermissionGroupModel;
}

export interface IContext extends IMainContext {
  models: IModels;
  commonQuerySelector: any;
  subdomain: string;
}

export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string,
  eventDispatcher: <TDocument extends Document = any>(
    pluginName: string,
    moduleName: string,
    collectionName: string,
  ) => any,
): IModels => {
  const models = {} as IModels;

  models.Users = db.model<IUserDocument, IUserModel>(
    'users',
    loadUserClass(
      models,
      subdomain,
      eventDispatcher('core', 'organization', 'users'),
    ),
  );

  models.Brands = db.model<IBrandDocument, IBrandModel>(
    'brands',
    loadBrandClass(
      subdomain,
      models,
      eventDispatcher('core', 'organization', 'brands'),
    ),
  );

  models.Conformities = db.model<IConformityDocument, IConformityModel>(
    'conformity',
    loadConformityClass(models, subdomain),
  );

  models.Customers = db.model<ICustomerDocument, ICustomerModel>(
    'customers',
    loadCustomerClass(
      models,
      subdomain,
      eventDispatcher('core', 'contacts', 'customers'),
    ),
  );

  models.Companies = db.model<ICompanyDocument, ICompanyModel>(
    'companies',
    loadCompanyClass(
      subdomain,
      models,
      eventDispatcher('core', 'contacts', 'companies'),
    ),
  );

  models.UserMovements = db.model<IUserMovementDocument, IUserMovemmentModel>(
    'user_movements',
    loadUserMovemmentClass(models, subdomain),
  );

  models.Configs = db.model<IConfigDocument, IConfigModel>(
    'configs',
    loadConfigClass(
      subdomain,
      models,
      eventDispatcher('core', 'organization', 'configs'),
    ),
  );

  models.Tags = db.model<ITagDocument, ITagModel>(
    'tags',
    loadTagClass(subdomain, models, eventDispatcher('core', 'tags', 'tags')),
  );

  models.InternalNotes = db.model<IInternalNoteDocument, IInternalNoteModel>(
    'internal_notes',
    loadInternalNoteClass(
      models,
      subdomain,
      eventDispatcher('core', 'internalNote', 'internal_notes'),
    ),
  );

  models.Products = db.model<IProductDocument, IProductModel>(
    'products',
    loadProductClass(
      models,
      subdomain,
      eventDispatcher('core', 'products', 'products'),
    ),
  );

  models.Uoms = db.model<IUomDocument, IUomModel>(
    'uoms',
    loadUomClass(
      models,
      subdomain,
      eventDispatcher('core', 'products', 'uoms'),
    ),
  );

  models.ProductsConfigs = db.model<
    IProductsConfigDocument,
    IProductsConfigModel
  >(
    'products_configs',
    loadProductsConfigClass(
      models,
      subdomain,
      eventDispatcher('core', 'products', 'products_configs'),
    ),
  );

  models.ProductCategories = db.model<
    IProductCategoryDocument,
    IProductCategoryModel
  >(
    'product_categories',
    loadProductCategoryClass(
      models,
      subdomain,
      eventDispatcher('core', 'products', 'product_categories'),
    ),
  );

  models.Structures = db.model<IStructureDocument, IStructureModel>(
    'structures',
    loadStructureClass(models),
  );
  models.Departments = db.model<IDepartmentDocument, IDepartmentModel>(
    'departments',
    loadDepartmentClass(
      models,
      eventDispatcher('core', 'organization', 'departments'),
    ),
  );
  models.Units = db.model<IUnitDocument, IUnitModel>(
    'units',
    loadUnitClass(models),
  );
  models.Branches = db.model<IBranchDocument, IBranchModel>(
    'branches',
    loadBranchClass(
      models,
      eventDispatcher('core', 'organization', 'branches'),
    ),
  );
  models.Positions = db.model<IPositionDocument, IPositionModel>(
    'positions',
    loadPositionClass(
      models,
      eventDispatcher('core', 'organization', 'positions'),
    ),
  );
  models.Apps = db.model<IAppDocument, IAppModel>(
    'apps',
    loadAppClass(subdomain, models, eventDispatcher('core', 'apps', 'apps')),
  );

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

  models.ActivityLogs = db.model<
    IActivityLogDocument,
    Model<IActivityLogDocument>
  >('activity_logs', activityLogsSchema);
  models.EngageMessages = db.model<IEngageMessageDocument, IEngageMessageModel>(
    'broadcast_engage_messages',
    loadEngageMessageClass(models, subdomain),
  );

  models.DeliveryReports = db.model<
    IDeliveryReportsDocument,
    IDeliveryReportModel
  >('broadcast_delivery_reports', deliveryReportsSchema);

  models.Stats = db.model<IStatsDocument, IStatsModel>(
    'broadcast_stats',
    loadStatsClass(models),
  );

  models.SmsRequests = db.model<ISmsRequestDocument, ISmsRequestModel>(
    'broadcast_engage_sms_requests',
    loadSmsRequestClass(models),
  );

  models.Imports = db.model<IImportDocument, IImportModel>(
    'imports',
    loadImportClass(
      models,
      eventDispatcher('core', 'import-export', 'imports'),
    ),
  );

  models.Exports = db.model<IExportDocument, IExportModel>(
    'exports',
    loadExportClass(
      models,
      eventDispatcher('core', 'import-export', 'exports'),
    ),
  );
  models.OrgWhiteLabel = db.model<IOrgWhiteLabelDocument, IOrgWhiteLabelModel>(
    'org_white_labels',
    loadOrgWhiteLabelClass(models),
  );
  models.ClientPortal = db.model<IClientPortalDocument, IClientPortalModel>(
    'client_portals',
    loadClientPortalClass(models),
  );

  models.CPUser = db.model<ICPUserDocument, ICPUserModel>(
    'client_portal_users',
    loadCPUserClass(
      models,
      subdomain,
      eventDispatcher('core', 'clientportal', 'cpUser'),
    ),
  );
  models.CPComments = db.model<ICPCommentDocument, ICPCommentsModel>(
    'client_portal_comments',
    loadCommentClass(
      models,
      subdomain,
      eventDispatcher('core', 'clientportal', 'client_portal_comments'),
    ),
  );

  models.CPNotifications = db.model<
    ICPNotificationDocument,
    ICPNotificationModel
  >('client_portal_notifications', loadCPNotificationClass(models));

  models.BundleCondition = db.model<
    IBundleConditionDocument,
    IBundleConditionModel
  >('bundle_conditions', loadBundleConditionClass(models, subdomain));

  models.BundleRule = db.model<IBundleRuleDocument, IBundleRuleModel>(
    'bundle_rules',
    loadBundleRuleClass(models, subdomain),
  );

  models.ProductRules = db.model<IProductRuleDocument, IProductRuleModel>(
    'product_rules',
    loadProductRuleClass(models, subdomain),
  );

  const db_name = db.name;

  const logDb = db.useDb(`${db_name}_logs`);

  models.Logs = logDb.model<ILogDocument, ILogModel>(
    'logs',
    loadLogsClass(models),
  );

  models.PermissionGroups = db.model<
    IPermissionGroupDocument,
    IPermissionGroupModel
  >('permission_groups', loadPermissionGroupClass(models));

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
