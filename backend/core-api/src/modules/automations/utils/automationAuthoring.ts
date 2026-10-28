import {
  IAutomationsActionConfig,
  IAutomationsTriggerConfig,
} from 'erxes-api-shared/core-modules';
import { createExpectedError } from 'erxes-api-shared/utils';
import { getAutomationConstants } from '../graphql/resolvers/utils/queriesUtils';

/**
 * Read side of authoring a flow without the builder (the assistant, imports):
 * a compact catalogue to choose node types from, then one node's contract.
 */

type TWithPlugin<T> = T & { pluginName?: string };
type TAutomationConstantsResponse = Awaited<
  ReturnType<typeof getAutomationConstants>
>;

const describeNode = (
  node: TWithPlugin<IAutomationsTriggerConfig | IAutomationsActionConfig>,
  kind: 'trigger' | 'action',
) => ({
  type: node.type,
  kind,
  pluginName: node.pluginName || 'core',
  label: node.label,
  description: node.description,
  hasConfigSchema: !!node.configJsonSchema,
});

const describeAction = (node: TWithPlugin<IAutomationsActionConfig>) => ({
  ...describeNode(node, 'action'),
  group: node.group,
  branches: node.folks?.map(({ key }) => key),
  requiresTargetTypes: node.requiresTargetTypes,
});

export const getAutomationNodeCatalog = async () => {
  const { triggersConst, actionsConst } = await getAutomationConstants();

  return {
    triggers: triggersConst.map((node) => describeNode(node, 'trigger')),
    actions: actionsConst.map(describeAction),
  };
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

/**
 * Fields an owner marked builderOnly (credentials) are named, not described:
 * the assistant's credential policy refuses a whole result naming them, and
 * the builder is where they are filled.
 */
const withoutBuilderOnly = (
  schema: unknown,
  path: string,
  hidden: string[],
): unknown => {
  if (Array.isArray(schema)) {
    return schema.map((entry) => withoutBuilderOnly(entry, path, hidden));
  }

  if (!isRecord(schema)) {
    return schema;
  }

  const properties = isRecord(schema.properties)
    ? Object.entries(schema.properties)
    : [];
  const builderOnly = properties
    .filter(([, field]) => isRecord(field) && field.builderOnly === true)
    .map(([name]) => name);

  hidden.push(...builderOnly.map((name) => (path ? `${path}.${name}` : name)));

  return Object.fromEntries(
    Object.entries(schema).map(([key, value]) => {
      if (key === 'properties') {
        return [
          key,
          Object.fromEntries(
            properties
              .filter(([name]) => !builderOnly.includes(name))
              .map(([name, field]) => [
                name,
                withoutBuilderOnly(
                  field,
                  path ? `${path}.${name}` : name,
                  hidden,
                ),
              ]),
          ),
        ];
      }

      if (key === 'required' && Array.isArray(value)) {
        return [key, value.filter((name) => !builderOnly.includes(name))];
      }

      return [key, withoutBuilderOnly(value, path, hidden)];
    }),
  );
};

const forAuthors = (schema: unknown) => {
  const builderOnlyFields: string[] = [];
  const configJsonSchema = withoutBuilderOnly(
    schema ?? null,
    '',
    builderOnlyFields,
  );

  return { configJsonSchema, builderOnlyFields };
};

export const getAutomationNodeSchema = async (type: string) => {
  const { triggersConst, actionsConst } = await getAutomationConstants();
  const trigger = triggersConst.find((node) => node.type === type);

  if (trigger) {
    return {
      ...describeNode(trigger, 'trigger'),
      ...forAuthors(trigger.configJsonSchema),
      output: trigger.output ?? null,
      inputs: null,
    };
  }

  const action = actionsConst.find((node) => node.type === type);

  if (!action) {
    throw createExpectedError(
      `Unknown automation node type "${type}"; pick one from automationNodeCatalog`,
      'AUTOMATION_NODE_TYPE_UNKNOWN',
    );
  }

  return {
    ...describeAction(action),
    ...forAuthors(action.configJsonSchema),
    output: action.output ?? null,
    inputs: action.inputs ?? null,
  };
};

const withoutConfigJsonSchema = <T extends { configJsonSchema?: unknown }>(
  node: T,
): T => {
  const copy = { ...node };

  delete copy.configJsonSchema;

  return copy;
};

/**
 * automationConstants keeps its payload: schemas are served per node, and a
 * schema naming credential fields would make the whole catalogue unreadable
 * to the assistant's credential policy.
 */
export const withoutConfigJsonSchemas = (
  constants: TAutomationConstantsResponse,
): TAutomationConstantsResponse => ({
  ...constants,
  triggersConst: constants.triggersConst.map(withoutConfigJsonSchema),
  actionsConst: constants.actionsConst.map(withoutConfigJsonSchema),
});
