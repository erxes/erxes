import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import {
  IUserModel,
  IUserMovemmentModel,
  loadUserClass,
  loadUserMovemmentClass,
} from './db/models/Users';
import { IUserDocument } from './db/models/definitions/users';
import { IBrandModel, loadBrandClass } from './db/models/Brands';
import {
  IConformityModel,
  loadConformityClass,
} from './db/models/Conformities';
import { IConfigModel, loadConfigClass } from './db/models/Configs';
import {
  IPermissionModel,
  IUserGroupModel,
  loadPermissionClass,
  loadUserGroupClass,
} from './db/models/Permissions';
import {
  IOnboardingHistoryModel,
  IRobotEntryModel,
  loadOnboardingHistoryClass,
  loadRobotClass,
} from './db/models/Robot';
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
} from './db/models/Structure';
import { IBrandDocument } from './db/models/definitions/brands';
import { IConformityDocument } from './db/models/definitions/conformities';
import { IConfigDocument } from './db/models/definitions/configs';
import {
  IPermissionDocument,
  IUserGroupDocument,
} from './db/models/definitions/permissions';
import {
  IOnboardingHistoryDocument,
  IRobotEntryDocument,
} from './db/models/definitions/robot';
import {
  IBranchDocument,
  IDepartmentDocument,
  IPositionDocument,
  IStructureDocument,
  IUnitDocument,
} from './db/models/definitions/structures';
import { IAppModel, loadAppClass } from './db/models/Apps';
import { IAppDocument } from './db/models/definitions/apps';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import {
  IInstallationLogModel,
  loadInstallationLogClass,
} from './db/models/InstallationLog';
import { IInstallationLogDocument } from './db/models/definitions/installationLogs';
import { IUserMovementDocument } from './db/models/definitions/users';
import { ITagDocument } from './db/models/definitions/tags';
import { ITagModel, loadTagClass } from './db/models/Tags';

import { loadFieldClass, loadGroupClass } from './db/models/Fields';
import { loadFormClass, loadFormSubmissionClass } from './db/models/Forms';

import {
  IInternalNoteModel,
  loadInternalNoteClass,
} from './db/models/InternalNotes';

import { IInternalNoteDocument } from './db/models/definitions/internalNotes';

import { IVisitorModel, loadVisitorClass } from './db/models/Visitors';
import {
  IActivityLogModel,
  loadActivityLogClass,
} from './db/models/ActivityLogs';
import { ILogModel, loadLogClass } from './db/models/Logs';

import { IVisitorDocument } from './db/models/definitions/visitors';
import { ILogDocument } from './db/models/definitions/logs';
import { IActivityLogDocument } from './db/models/definitions/activityLogs';
import {
  IEmailDeliveryModel,
  loadEmailDeliveryClass,
} from './db/models/EmailDeliveries';

import { IEmailDeliveriesDocument } from './db/models/definitions/emailDeliveries';

import { ISegmentDocument } from './db/models/definitions/segments';
import { ISegmentModel, loadSegmentClass } from './db/models/Segments';
import { IFieldGroupModel, IFieldModel } from './db/models/Fields';
import { IFormModel, IFormSubmissionModel } from './db/models/Forms';
import {
  IFieldDocument,
  IFieldGroupDocument,
} from './db/models/definitions/fields';
import { IForm, IFormSubmissionDocument } from './db/models/definitions/forms';
import { ICustomerModel, loadCustomerClass } from './db/models/Customers';
import { ICompanyModel, loadCompanyClass } from './db/models/Companies';
import { ICustomerDocument } from './db/models/definitions/customers';
import { ICompanyDocument } from './db/models/definitions/companies';
import {
  IProductCategoryModel,
  IProductModel,
  loadProductCategoryClass,
  loadProductClass,
} from './db/models/Products';
import {
  IProductsConfigModel,
  loadProductsConfigClass,
} from './db/models/ProductConfig';
import { IUomModel, loadUomClass } from './db/models/Uoms';
import {
  IProductCategoryDocument,
  IProductDocument,
  IProductsConfigDocument,
  IUomDocument,
} from './db/models/definitions/products';

import { IEmailTemplateDocument } from './db/models/definitions/emailTemplates';

import {
  IEmailTemplateModel,
  loadEmailTemplateClass,
} from './db/models/EmailTemplates';

import { IDashboardModel, loadDashboardClass } from './db/models/Dashboard';
import { ISectionModel, loadSectionClass } from './db/models/Section';
import { IChartModel, loadChartClass } from './db/models/Chart';
import { IReportModel, loadReportClass } from './db/models/Report';

import { IDataLoaders } from './data/dataLoaders';
import {
  IChartDocument,
  IDashboardDocument,
  IReportDocument,
  ISectionDocument,
} from './db/models/definitions/insight';
import {
  IExchangeRateModel,
  loadExchangeRateClass,
} from './db/models/ExchangeRates';
import { IExchangeRateDocument } from './db/models/definitions/exchangeRate';
import { IClientModel, loadClientClass } from "./db/models/Client";
import { IClientDocument } from "./db/models/definitions/client";

export interface IModels {
  Users: IUserModel;
  Brands: IBrandModel;
  Conformities: IConformityModel;
  Configs: IConfigModel;
  Permissions: IPermissionModel;
  UsersGroups: IUserGroupModel;
  RobotEntries: IRobotEntryModel;
  OnboardingHistories: IOnboardingHistoryModel;
  Structures: IStructureModel;
  Departments: IDepartmentModel;
  Units: IUnitModel;
  Branches: IBranchModel;
  Positions: IPositionModel;
  Apps: IAppModel;
  InstallationLogs: IInstallationLogModel;
  UserMovements: IUserMovemmentModel;
  Tags: ITagModel;
  InternalNotes: IInternalNoteModel;
  Visitors: IVisitorModel;
  ActivityLogs: IActivityLogModel;
  Logs: ILogModel;
  EmailDeliveries: IEmailDeliveryModel;
  Segments: ISegmentModel;
  Fields: IFieldModel;
  FieldsGroups: IFieldGroupModel;
  Forms: IFormModel;
  FormSubmissions: IFormSubmissionModel;
  Customers: ICustomerModel;
  Companies: ICompanyModel;
  Products: IProductModel;
  ProductCategories: IProductCategoryModel;
  ProductsConfigs: IProductsConfigModel;
  Uoms: IUomModel;
  EmailTemplates: IEmailTemplateModel;
  Dashboards: IDashboardModel;
  Sections: ISectionModel;
  Charts: IChartModel;
  Reports: IReportModel;
  Clients: IClientModel;
  ExchangeRates: IExchangeRateModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
  dataLoaders: IDataLoaders;
}

export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string
): IModels => {
  const models = {} as IModels;

  models.Users = db.model<IUserDocument, IUserModel>(
    'users',
    loadUserClass(models)
  );
  models.Brands = db.model<IBrandDocument, IBrandModel>(
    'brands',
    loadBrandClass(models)
  );
  models.Conformities = db.model<IConformityDocument, IConformityModel>(
    'conformity',
    loadConformityClass(models, subdomain)
  );

  models.Configs = db.model<IConfigDocument, IConfigModel>(
    'configs',
    loadConfigClass(models)
  );
  models.Permissions = db.model<IPermissionDocument, IPermissionModel>(
    'permissions',
    loadPermissionClass(models)
  );
  models.UsersGroups = db.model<IUserGroupDocument, IUserGroupModel>(
    'user_groups',
    loadUserGroupClass(models)
  );

  models.UserMovements = db.model<IUserMovementDocument, IUserMovemmentModel>(
    'user_movements',
    loadUserMovemmentClass(models)
  );

  models.RobotEntries = db.model<IRobotEntryDocument, IRobotEntryModel>(
    'robot_entries',
    loadRobotClass(models)
  );
  models.OnboardingHistories = db.model<
    IOnboardingHistoryDocument,
    IOnboardingHistoryModel
  >('onboarding_histories', loadOnboardingHistoryClass(models));

  models.Structures = db.model<IStructureDocument, IStructureModel>(
    'structures',
    loadStructureClass(models)
  );
  models.Departments = db.model<IDepartmentDocument, IDepartmentModel>(
    'departments',
    loadDepartmentClass(models)
  );
  models.Units = db.model<IUnitDocument, IUnitModel>(
    'units',
    loadUnitClass(models)
  );
  models.Branches = db.model<IBranchDocument, IBranchModel>(
    'branches',
    loadBranchClass(models)
  );

  models.Positions = db.model<IPositionDocument, IPositionModel>(
    'positions',
    loadPositionClass(models)
  );

  models.Apps = db.model<IAppDocument, IAppModel>('apps', loadAppClass(models));
  models.InstallationLogs = db.model<
    IInstallationLogDocument,
    IInstallationLogModel
  >('installation_logs', loadInstallationLogClass(models));

  models.Tags = db.model<ITagDocument, ITagModel>('tags', loadTagClass(models));

  models.InternalNotes = db.model<IInternalNoteDocument, IInternalNoteModel>(
    'internal_notes',
    loadInternalNoteClass(models)
  );

  models.ActivityLogs = db.model<IActivityLogDocument, IActivityLogModel>(
    'activity_logs',
    loadActivityLogClass(models, subdomain)
  );

  models.Logs = db.model<ILogDocument, ILogModel>('logs', loadLogClass(models));

  models.Visitors = db.model<IVisitorDocument, IVisitorModel>(
    'visitors',
    loadVisitorClass(models)
  );

  models.EmailDeliveries = db.model<
    IEmailDeliveriesDocument,
    IEmailDeliveryModel
  >('email_deliveries', loadEmailDeliveryClass(models));

  models.Segments = db.model<ISegmentDocument, ISegmentModel>(
    'segments',
    loadSegmentClass(models)
  );

  models.Fields = db.model<IFieldDocument, IFieldModel>(
    'form_fields',
    loadFieldClass(models, subdomain)
  );
  models.FieldsGroups = db.model<IFieldGroupDocument, IFieldGroupModel>(
    'fields_groups',
    loadGroupClass(models)
  );
  models.Forms = db.model<IForm, IFormModel>('forms', loadFormClass(models));
  models.FormSubmissions = db.model<
    IFormSubmissionDocument,
    IFormSubmissionModel
  >('form_submissions', loadFormSubmissionClass(models));

  models.Customers = db.model<ICustomerDocument, ICustomerModel>(
    'customers',
    loadCustomerClass(models, subdomain)
  );

  models.Companies = db.model<ICompanyDocument, ICompanyModel>(
    'companies',
    loadCompanyClass(models, subdomain)
  );

  models.Products = db.model<IProductDocument, IProductModel>(
    'products',
    loadProductClass(models, subdomain)
  );

  models.Uoms = db.model<IUomDocument, IUomModel>(
    'uoms',
    loadUomClass(models, subdomain)
  );
  models.ProductsConfigs = db.model<
    IProductsConfigDocument,
    IProductsConfigModel
  >('products_configs', loadProductsConfigClass(models));

  models.ProductCategories = db.model<
    IProductCategoryDocument,
    IProductCategoryModel
  >('product_categories', loadProductCategoryClass(models));

  models.EmailTemplates = db.model<IEmailTemplateDocument, IEmailTemplateModel>(
    'email_templates',
    loadEmailTemplateClass(models)
  );

  models.Dashboards = db.model<IDashboardDocument, IDashboardModel>(
    'dashboards',
    loadDashboardClass(models, subdomain)
  );

  models.Charts = db.model<IChartDocument, IChartModel>(
    'insight_chart',
    loadChartClass(models)
  );

  models.Reports = db.model<IReportDocument, IReportModel>(
    'report',
    loadReportClass(models)
  );

  models.Sections = db.model<ISectionDocument, ISectionModel>(
    'sections',
    loadSectionClass(models, subdomain)
  );

  models.Clients = db.model<IClientDocument, IClientModel>(
    "clients",
    loadClientClass(models)
  );

  models.ExchangeRates = db.model<IExchangeRateDocument, IExchangeRateModel>(
    'exchange_rates',
    loadExchangeRateClass(models, subdomain)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
