import type { FormDetailQuery, FormsQuery } from '~/gql/graphql';
import { z } from 'zod';
import { LEAD_DATA_SCHEMA } from '../constants/formSchema';

export type FieldValidatorType = 'PRESET' | 'CUSTOM' | 'NONE';
export type FieldValidatorPresetKey =
  | 'EMAIL'
  | 'PHONE'
  | 'POSTAL_CODE'
  | 'ALPHANUMERIC'
  | 'MN_VEHICLE_REGISTRATION'
  | 'NUMBER'
  | 'DATE'
  | 'DATE_TIME';

export interface IFieldValidator {
  type: FieldValidatorType;
  presetKey?: FieldValidatorPresetKey;
  customRegex?: string;
  errorMessage?: string;
}

export interface IFormFieldLogics {
  fieldId: string;
  logicOperator?: string;
  logicValue?: any;
}

export type IForm = NonNullable<
  NonNullable<NonNullable<FormsQuery['forms']>['list']>[number]
>;

export type IFormDetail = NonNullable<FormDetailQuery['formDetail']>;

export type ILeadData = z.infer<typeof LEAD_DATA_SCHEMA>;

export type IFormField = NonNullable<
  NonNullable<IFormDetail['fields']>[number]
>;

export interface IFormSetupPayload {
  title: string;
}

export enum FormsPageHotKeyScope {
  FormsPage = 'forms-page',
}

export enum LogicStringOperators {
  Is = 'is',
  IsNot = 'isNot',
  StartsWith = 'startsWith',
  EndsWith = 'endsWith',
  Contains = 'contains',
  DoesNotContain = 'doesNotContain',
  IsUnknown = 'isUnknown',
  HasAnyValu = 'hasAnyValue',
}

export enum LogicNumberOperators {
  GreaterThan = 'greaterThan',
  LessThan = 'lessThan',
  Equal = 'is',
  NotEqual = 'isNot',
  IsUnknown = 'isUnknown',
  HasAnyValue = 'hasAnyValue',
}

export enum LogicDateOperators {
  GreaterThan = 'dateGreaterThan',
  LessThan = 'dateLessThan',
}
