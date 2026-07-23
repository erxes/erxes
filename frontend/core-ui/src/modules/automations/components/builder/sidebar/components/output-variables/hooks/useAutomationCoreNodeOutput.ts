import type { TIncomingWebhookForm } from '@/automations/components/builder/nodes/triggers/webhooks/states/automationIncomingWebhookFormDefinition';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { AutomationNodeType } from '@/automations/types';
import { generateAttributesFromWebhookSchema } from '@/automations/utils/webhookSchemaUtils';
import {
  TAutomationOutputPropertySource,
  TAutomationOutputVariable,
  TAutomationVariableSourceNode,
} from '../AutomationVariableBrowserTypes';

const INCOMING_WEBHOOK_TRIGGER_TYPE = 'core:webhooks.incoming';

// Core node types are single tokens without a plugin prefix (aiAgent, transform, findObject, ...)
export const isCoreAutomationNodeType = (type?: string): boolean =>
  Boolean(type) && !String(type).includes(':');

const buildIncomingWebhookReferenceVariables = (
  config?: Partial<TIncomingWebhookForm>,
) => {
  const schema = Array.isArray(config?.schema) ? config.schema : [];
  const headers = Array.isArray(config?.headers) ? config.headers : [];

  const bodyReferenceFields =
    generateAttributesFromWebhookSchema(schema).map((attribute) => ({
      key: attribute.path,
      label: attribute.label || attribute.name,
      type: attribute.type,
    })) || [];

  const headerReferenceFields =
    headers
      .filter((header) => header.key?.trim())
      .map((header) => ({
        key: header.key.trim(),
        label: header.description?.trim() || header.key.trim(),
        type: 'string',
      })) || [];

  return {
    bodyReferenceFields,
    headerReferenceFields,
  };
};

type TUseAutomationCoreNodeOutputArgs = {
  activeSourceNode: TAutomationVariableSourceNode | null;
  sourceNodeConfig?: Record<string, any>;
  variables: TAutomationOutputVariable[];
  propertySource?: TAutomationOutputPropertySource;
};

export const useAutomationCoreNodeOutput = ({
  activeSourceNode,
  sourceNodeConfig,
  variables,
  propertySource,
}: TUseAutomationCoreNodeOutputArgs) => {
  const { findObjectTargetsConst } = useAutomation();

  const isAction = activeSourceNode?.nodeType === AutomationNodeType.Action;

  const aiAgentFieldDefinitions =
    isAction && activeSourceNode?.type === 'aiAgent'
      ? sourceNodeConfig?.goalType === 'classification'
        ? sourceNodeConfig?.objectFields
        : sourceNodeConfig?.goalType === 'generateText'
          ? sourceNodeConfig?.captureFields
          : []
      : [];

  const aiAgentAttributeFields = (aiAgentFieldDefinitions || [])
    .filter((field: any) => field?.fieldName?.trim())
    .map((field: any) => ({
      key: field.fieldName.trim(),
      label: field.fieldName.trim(),
      type: field.dataType,
    }));

  const aiAgentVariables = aiAgentAttributeFields.length
    ? variables.map((variable) =>
        variable.key === 'attributes'
          ? {
              ...variable,
              exposure: 'reference' as const,
              referenceFields: aiAgentAttributeFields,
            }
          : variable,
      )
    : variables;

  const webhookReferenceVariables =
    activeSourceNode?.nodeType === AutomationNodeType.Trigger &&
    activeSourceNode.type === INCOMING_WEBHOOK_TRIGGER_TYPE
      ? buildIncomingWebhookReferenceVariables(sourceNodeConfig)
      : null;

  const enrichedVariables = webhookReferenceVariables
    ? aiAgentVariables.map((variable) => {
        if (variable.key === 'body') {
          return webhookReferenceVariables.bodyReferenceFields.length
            ? {
                ...variable,
                exposure: 'reference' as const,
                referenceFields: webhookReferenceVariables.bodyReferenceFields,
              }
            : {
                ...variable,
                exposure: undefined,
                referenceFields: undefined,
              };
        }

        if (variable.key === 'headers') {
          return webhookReferenceVariables.headerReferenceFields.length
            ? {
                ...variable,
                exposure: 'reference' as const,
                referenceFields:
                  webhookReferenceVariables.headerReferenceFields,
              }
            : {
                ...variable,
                exposure: undefined,
                referenceFields: undefined,
              };
        }

        return variable;
      })
    : aiAgentVariables;

  const findObjectTarget =
    isAction && activeSourceNode?.type === 'findObject'
      ? findObjectTargetsConst.find(
          (target: any) => target.value === sourceNodeConfig?.objectType,
        )
      : null;

  const findObjectVariables =
    findObjectTarget?.output?.variables?.map(
      (variable: TAutomationOutputVariable) => ({
        ...variable,
        key: `object.${variable.key}`,
        label: `${findObjectTarget.label} ${variable.label}`,
        sourceType: findObjectTarget.value,
      }),
    ) || [];

  const findObjectPropertySource = findObjectTarget?.output?.propertySource
    ? ({
        ...findObjectTarget.output.propertySource,
        key: `object.${findObjectTarget.output.propertySource.key}`,
        label: `${findObjectTarget.label} ${findObjectTarget.output.propertySource.label}`,
      } as TAutomationOutputPropertySource)
    : undefined;

  const transformVariables =
    isAction && activeSourceNode?.type === 'transform'
      ? (sourceNodeConfig?.mappings || [])
          .filter((mapping: any) => mapping?.key)
          .map((mapping: any) => ({
            key: `data.${mapping.key}`,
            label: mapping.key,
          }))
      : [];

  return {
    coreVariables: [
      ...enrichedVariables,
      ...findObjectVariables,
      ...transformVariables,
    ],
    corePropertySource: findObjectPropertySource || propertySource,
  };
};
