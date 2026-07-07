import type { TIncomingWebhookForm } from '@/automations/components/builder/nodes/triggers/webhooks/states/automationIncomingWebhookFormDefinition';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { AUTOMATION_NODE_OUTPUT } from '@/automations/graphql/automationQueries';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { AutomationNodeType } from '@/automations/types';
import { generateAttributesFromWebhookSchema } from '@/automations/utils/webhookSchemaUtils';
import { useQuery } from '@apollo/client';
import {
  TAutomationNodeOutputResponse,
  TAutomationOutputPropertySource,
  TAutomationOutputVariable,
  TAutomationVariableSourceNode,
} from '../AutomationVariableBrowserTypes';
import { splitAutomationNodeType } from 'ui-modules/modules/automations';

const INCOMING_WEBHOOK_TRIGGER_TYPE = 'core:webhooks.incoming';

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

export const useAutomationNodeOutput = (
  activeSourceNode: TAutomationVariableSourceNode | null,
) => {
  const { findObjectTargetsConst } = useAutomation();
  const { actions, triggers } = useAutomationNodes();
  const [pluginName, moduleName, recordName] = splitAutomationNodeType(
    activeSourceNode?.type || '',
  );
  const { data, loading } = useQuery<TAutomationNodeOutputResponse>(
    AUTOMATION_NODE_OUTPUT,
    {
      skip: !activeSourceNode?.type,
      variables: {
        nodeType: `${pluginName}:${moduleName}.${recordName}`,
      },
      fetchPolicy: 'cache-first',
    },
  );

  const variables = data?.automationNodeOutput?.variables || [];
  const propertySource = data?.automationNodeOutput?.propertySource;
  const sourceNodeConfig =
    activeSourceNode?.nodeType === AutomationNodeType.Action
      ? actions.find((action) => action.id === activeSourceNode.id)?.config
      : triggers.find((trigger) => trigger.id === activeSourceNode?.id)?.config;

  const findObjectTarget =
    activeSourceNode?.nodeType === AutomationNodeType.Action &&
    activeSourceNode?.type === 'findObject'
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
    activeSourceNode?.nodeType === AutomationNodeType.Action &&
    activeSourceNode?.type === 'transform'
      ? (sourceNodeConfig?.mappings || [])
          .filter((mapping: any) => mapping?.key)
          .map((mapping: any) => ({
            key: `data.${mapping.key}`,
            label: mapping.key,
          }))
      : [];

  const webhookReferenceVariables =
    activeSourceNode?.nodeType === AutomationNodeType.Trigger &&
    activeSourceNode.type === INCOMING_WEBHOOK_TRIGGER_TYPE
      ? buildIncomingWebhookReferenceVariables(sourceNodeConfig)
      : null;

  const aiAgentFieldDefinitions =
    activeSourceNode?.nodeType === AutomationNodeType.Action &&
    activeSourceNode?.type === 'aiAgent'
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

  const baseVariables = aiAgentAttributeFields.length
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

  const nodeVariables = webhookReferenceVariables
    ? baseVariables.map((variable) => {
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
    : baseVariables;

  const mergedVariables = [
    ...nodeVariables,
    ...findObjectVariables,
    ...transformVariables,
  ].filter(
    (variable, index, array) =>
      array.findIndex((candidate) => candidate.key === variable.key) === index,
  );

  const mergedPropertySource = findObjectPropertySource || propertySource;

  return {
    loading,
    mergedVariables,
    mergedPropertySource,
  };
};
