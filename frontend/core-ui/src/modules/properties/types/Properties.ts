import {
  logicSchema,
  propertyGroupSchema,
  propertySchema,
} from '@/properties/propertySchema';
import { z } from 'zod';

export interface IPropertyType {
  contentType: string;
  description: string;
}

export enum PropertiesHotkeyScope {
  MainPage = 'properties-page',
  AddPropertiesDropdown = 'add-properties-dropdown',
}

export type IPropertyGroupForm = z.infer<typeof propertyGroupSchema>;
export type IPropertyForm = z.infer<typeof propertySchema>;

export interface IFieldGroup {
  _id: string;
  name: string;
  code: string;
  description: string;
  contentType: string;
  order: number;
  logics?: Record<string, unknown>;
  configs?: { isMultiple?: boolean };
}

export type IPropertySystemFieldLogic = z.infer<typeof logicSchema>;

export interface IPropertySystemFieldConfig {
  isVisible: boolean;
  isVisibleToCreate: boolean;
  isRequired: boolean;
  logics: IPropertySystemFieldLogic[];
}

export interface IPropertySystemField extends IPropertySystemFieldConfig {
  code: string;
  name: string;
  type: string;
}
