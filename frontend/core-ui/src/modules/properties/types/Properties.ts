import { z } from 'zod';
import { logicSchema } from 'ui-modules';

export interface IPropertyType {
  contentType: string;
  description: string;
}

export enum PropertiesHotkeyScope {
  MainPage = 'properties-page',
  AddPropertiesDropdown = 'add-properties-dropdown',
}

export interface IFieldGroup {
  _id: string;
  name: string;
  code: string;
  description: string;
  contentType: string;
  order: number;
  logics?: Record<string, unknown>;
  configs?: { isMultiple?: boolean; layout?: string[][] };
  // Set when a plugin feature keeps its featured fields in this group.
  owner?: { plugin?: string; module?: string; status?: string } | null;
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
  // Declared by the owning content type; they lock the toggles below.
  requiredGroup?: string | null;
  alwaysFilled?: boolean | null;
  notOnCreate?: boolean | null;
  outsideLayout?: boolean | null;
}
