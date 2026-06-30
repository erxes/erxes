import { AutomationNodeType } from '@/automations/types';

import { TAutomationVariableDragPayload } from 'ui-modules';

export type TAutomationOutputVariable = {
  key: string;
  label: string;
  exposure?: 'placeholder' | 'reference';
  field?: string;
  referenceFields?: TAutomationOutputVariable[];
  referenceType?: string;
  sourceType?: string;
  type?: string;
};

export type TAutomationOutputPropertySource = {
  key: string;
  label: string;
  propertyType: string;
};

export type TAutomationNodeOutput = {
  variables?: TAutomationOutputVariable[];
  propertySource?: TAutomationOutputPropertySource;
};

export type TAutomationNodeOutputResponse = {
  automationNodeOutput: TAutomationNodeOutput | null;
};

export type TAutomationReferenceFieldsResponse = {
  automationReferenceFields: TAutomationOutputVariable[];
};

export type TAutomationVariableSourceNode = {
  id: string;
  type: string;
  nodeType: AutomationNodeType;
  label: string;
  icon?: string;
};

export type TAutomationVariableEmptyState = {
  title: string;
  description: string;
};

export type TAutomationVariablePayloadArgs = {
  key: string;
  label: string;
  path: string;
  token: string;
};

export type TAutomationVariablePayloadBuilder = (
  args: TAutomationVariablePayloadArgs,
) => TAutomationVariableDragPayload;

export type TAutomationVariableBrowserProps = {
  sourceNode?: TAutomationVariableSourceNode | null;
  sourceNodes?: TAutomationVariableSourceNode[];
  emptyState?: TAutomationVariableEmptyState | null;
  onInsertVariable?: (payload: TAutomationVariableDragPayload) => void;
  sourceSectionTitle?: string;
  className?: string;
};
