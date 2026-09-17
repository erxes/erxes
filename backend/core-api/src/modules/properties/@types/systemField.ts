import { IPropertySystemField } from 'erxes-api-shared/core-modules';
import { Document } from 'mongoose';

export interface ISystemFieldLogic {
  field: string;
  operator: string;
  value: string;
  action: string;
}

export interface ISystemFieldConfig {
  isVisible: boolean;
  isVisibleToCreate: boolean;
  isRequired: boolean;
  logics: ISystemFieldLogic[];
}

export interface ISystemFieldSetting extends Partial<ISystemFieldConfig> {
  contentType: string;
  code: string;
}

export interface ISystemFieldSettingDocument
  extends ISystemFieldSetting,
    Document {
  _id: string;

  updatedBy?: string;
}

export type IResolvedSystemField = IPropertySystemField & ISystemFieldConfig;
