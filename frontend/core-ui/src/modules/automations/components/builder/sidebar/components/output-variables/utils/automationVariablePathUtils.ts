import { TAutomationVariableSourceNode } from '../AutomationVariableBrowserTypes';

export const buildAutomationVariablePath = (scope: string, path: string) =>
  scope ? `${scope}.${path}` : path;

export const buildAutomationVariableToken = (scope: string, path: string) =>
  `{{ ${buildAutomationVariablePath(scope, path)} }}`;

export const buildAutomationVariablePayload = ({
  activeSourceNode,
  key,
  label,
  path,
  token,
}: {
  activeSourceNode: TAutomationVariableSourceNode | null;
  key: string;
  label: string;
  path: string;
  token: string;
}) => ({
  key,
  label,
  path,
  token,
  sourceNodeId: activeSourceNode?.id || '',
  sourceNodeType: activeSourceNode?.type || '',
  sourceNodeLabel: activeSourceNode?.label || '',
});
