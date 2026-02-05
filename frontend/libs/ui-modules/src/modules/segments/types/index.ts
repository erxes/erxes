import { z } from 'zod';
import { segmentFormSchema } from '../states/segmentFormSchema';
import { IField } from 'ui-modules/modules/properties';

export type TSegmentForm = z.infer<typeof segmentFormSchema>;
export interface ListQueryResponse {
  segments: ISegment[];
}

export interface IAttributeFilter {
  name: string;
  operator: string;
  value: string;
}

export interface IOperator {
  name: string;
  value: string;
  noInput?: boolean;
}

export interface ICondition {
  // type: 'property' | 'event' | 'subSegment';

  propertyType?: string;
  propertyName?: string;
  propertyOperator?: string;
  propertyValue?: string;

  eventName?: string;
  eventOccurence?: 'exactly' | 'atleast' | 'atmost';
  eventOccurenceValue?: number;
  eventAttributeFilters?: IAttributeFilter[];

  subSegmentId?: string;
  subSegmentForPreview?: ISegment;

  config?: any;
}

export interface ISegment {
  _id: string;
  contentType: string;
  name: string;
  description?: string;
  subOf?: string;
  color?: string;
  shouldWriteActivityLog: boolean;
  count?: number;

  conditions: ICondition[];
  conditionsConjunction?:
    | TConditionsConjunction.AND
    | TConditionsConjunction.OR;
  conditionSegments: ISegment[];

  scopeBrandIds?: string[];

  config?: any;
}

export type FieldQueryResponse = {
  fieldsCombinedByContentType: IField[];
  segmentsGetAssociationTypes: { value: string; description: string }[];
};

export type IFormFieldName =
  | `conditions.${number}`
  | `conditionSegments.${number}.conditions.${number}`;

export type IProperty = {
  index: number;
  remove: () => void;
  total: number;
  parentFieldName?: `conditionSegments.${number}`;
};

export type IPropertyField = {
  index: number;
  fields: IField[];
  currentField?: IField;
  parentFieldName: IFormFieldName;
  defaultValue?: any;
  propertyTypes: any[];
  loading: boolean;
};

export type IPropertyCondtion = {
  index: number;
  currentField?: IField;
  operators: IOperator[];
  parentFieldName: IFormFieldName;
  defaultValue?: any;
  loading: boolean;
};

export type IPropertyInput = {
  index: number;
  parentFieldName: IFormFieldName;
  defaultValue?: any;
  operators: IOperator[];
  selectedField?: IField;
  loading: boolean;
};

export interface ISegmentMap {
  _id?: string;
  key: string;
  contentType: string;
  config?: any;
  conditions: ICondition[];
  conditionsConjunction: string;
}

export interface IConditionsForPreview {
  type: string;
  subSegmentForPreview: ISegmentMap;
}

export enum TConditionsConjunction {
  AND = 'and',
  OR = 'or',
}
