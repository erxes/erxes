import * as mongoose from "mongoose";
import { IContext as IMainContext } from "@erxes/api-utils/src";
import {
  IUserModel,
  IUserMovemmentModel,
  loadUserClass,
  loadUserMovemmentClass
} from "./db/models/Users";
import { IUserDocument } from "./db/models/definitions/users";
import { IBrandModel, loadBrandClass } from "./db/models/Brands";
import {
  IConformityModel,
  loadConformityClass
} from "./db/models/Conformities";
import { IConfigModel, loadConfigClass } from "./db/models/Configs";
import {
  IPermissionModel,
  IUserGroupModel,
  loadPermissionClass,
  loadUserGroupClass
} from "./db/models/Permissions";
import {
  IOnboardingHistoryModel,
  IRobotEntryModel,
  loadOnboardingHistoryClass,
  loadRobotClass
} from "./db/models/Robot";
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
  loadUnitClass
} from "./db/models/Structure";
import { IBrandDocument } from "./db/models/definitions/brands";
import { IConformityDocument } from "./db/models/definitions/conformities";
import { IConfigDocument } from "./db/models/definitions/configs";
import {
  IPermissionDocument,
  IUserGroupDocument
} from "./db/models/definitions/permissions";
import {
  IOnboardingHistoryDocument,
  IRobotEntryDocument
} from "./db/models/definitions/robot";
import {
  IBranchDocument,
  IDepartmentDocument,
  IPositionDocument,
  IStructureDocument,
  IUnitDocument
} from "./db/models/definitions/structures";
import { IAppModel, loadAppClass } from "./db/models/Apps";
import { IAppDocument } from "./db/models/definitions/apps";
import { createGenerateModels } from "@erxes/api-utils/src/core";
import {
  IInstallationLogModel,
  loadInstallationLogClass
} from "./db/models/InstallationLog";
import { IInstallationLogDocument } from "./db/models/definitions/installationLogs";
import { IUserMovementDocument } from "./db/models/definitions/users";
import { ITagDocument } from "./db/models/definitions/tags";
import { ITagModel, loadTagClass } from "./db/models/Tags";

import {
  IInternalNoteModel,
  loadInternalNoteClass
} from "./db/models/InternalNotes";

import { IInternalNoteDocument } from "./db/models/definitions/internalNotes";

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
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string
): IModels => {
  const models = {} as IModels;

  models.Users = db.model<IUserDocument, IUserModel>(
    "users",
    loadUserClass(models)
  );
  models.Brands = db.model<IBrandDocument, IBrandModel>(
    "brands",
    loadBrandClass(models)
  );
  models.Conformities = db.model<IConformityDocument, IConformityModel>(
    "conformity",
    loadConformityClass(models, subdomain)
  );

  models.Configs = db.model<IConfigDocument, IConfigModel>(
    "configs",
    loadConfigClass(models)
  );
  models.Permissions = db.model<IPermissionDocument, IPermissionModel>(
    "permissions",
    loadPermissionClass(models)
  );
  models.UsersGroups = db.model<IUserGroupDocument, IUserGroupModel>(
    "user_groups",
    loadUserGroupClass(models)
  );

  models.UserMovements = db.model<IUserMovementDocument, IUserMovemmentModel>(
    "user_movements",
    loadUserMovemmentClass(models)
  );

  models.RobotEntries = db.model<IRobotEntryDocument, IRobotEntryModel>(
    "robot_entries",
    loadRobotClass(models)
  );
  models.OnboardingHistories = db.model<
    IOnboardingHistoryDocument,
    IOnboardingHistoryModel
  >("onboarding_histories", loadOnboardingHistoryClass(models));

  models.Structures = db.model<IStructureDocument, IStructureModel>(
    "structures",
    loadStructureClass(models)
  );
  models.Departments = db.model<IDepartmentDocument, IDepartmentModel>(
    "departments",
    loadDepartmentClass(models)
  );
  models.Units = db.model<IUnitDocument, IUnitModel>(
    "units",
    loadUnitClass(models)
  );
  models.Branches = db.model<IBranchDocument, IBranchModel>(
    "branches",
    loadBranchClass(models)
  );

  models.Positions = db.model<IPositionDocument, IPositionModel>(
    "positions",
    loadPositionClass(models)
  );

  models.Apps = db.model<IAppDocument, IAppModel>("apps", loadAppClass(models));
  models.InstallationLogs = db.model<
    IInstallationLogDocument,
    IInstallationLogModel
  >("installation_logs", loadInstallationLogClass(models));

  models.Tags = db.model<ITagDocument, ITagModel>("tags", loadTagClass(models));

  models.InternalNotes = db.model<IInternalNoteDocument, IInternalNoteModel>(
    "internal_notes",
    loadInternalNoteClass(models)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
