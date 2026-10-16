import { ReactElement } from 'react';
import { ControllerProps, FieldValues, UseFormReturn } from 'react-hook-form';

// Mirrors erxes-api-shared/core-modules/automations/conditionals.ts

export type TAutomationValueCondition = {
  kind: 'value';
  left: string;
  operator: string;
  right?: string;
  meta?: Record<string, unknown>;
};

export type TAutomationSegmentCondition = {
  kind: 'segment';
  segmentId: string;
};

export type TAutomationCondition =
  | TAutomationValueCondition
  | TAutomationSegmentCondition;

export type TAutomationConditionalRow = {
  id: string;
  conjunction?: 'and' | 'or';
  conditions: TAutomationCondition[];
  values: Record<string, unknown>;
};

export type TAutomationConditional = {
  keys: string[];
  label?: string;
  // Builder-only: whether otherwise may be left empty
  required?: boolean;
  rows: TAutomationConditionalRow[];
  otherwise: Record<string, unknown>;
};

export type TAutomationConditionals = Record<string, TAutomationConditional>;

export type TAutomationConditionalErrors = Record<string, string[]>;

// Same arguments Form.Field hands its render, plus the form the input belongs
// to: the action form, or a row's own form when the value is conditional
export type TAutomationConditionalFieldRender = (
  props: Parameters<ControllerProps<FieldValues, string>['render']>[0] & {
    form: UseFormReturn<FieldValues>;
  },
) => ReactElement;
