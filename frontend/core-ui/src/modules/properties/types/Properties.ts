import {
  propertyGroupSchema,
  propertySchema,
} from '@/properties/propertySchema';
import { z } from 'zod';

export interface IPropertyType {
  contentType: string;
  label: string;
}

export enum PropertiesHotkeyScope {
  MainPage = 'properties-page',
  AddPropertiesDropdown = 'add-properties-dropdown',
}

export type IPropertyGroupForm = z.infer<typeof propertyGroupSchema>;
export type IPropertyForm = z.infer<typeof propertySchema>;
