// MongoDB 4.4.25 compatible
import type { Tool } from '@mastra/core/tools' with {
  'resolution-mode': 'import',
};

type ToolWithInputSchema = Pick<Tool, 'inputSchema'>;

const compatibleTools = new WeakSet<ToolWithInputSchema>();

const omitDialectMarker = (
  jsonSchema: Record<string, unknown>,
): Record<string, unknown> => {
  const compatibleSchema = { ...jsonSchema };

  delete compatibleSchema.$schema;

  return compatibleSchema;
};

/**
 * Mastra includes JSON Schema's optional `$schema` dialect marker in every
 * model-facing tool definition. Suspended runs persist that request body in a
 * workflow snapshot, but MongoDB 4.4 rejects nested keys beginning with `$`.
 * Omitting only the marker keeps the parameter schema unchanged and lets the
 * same snapshot work on both older and current MongoDB versions.
 */
export const makeToolInputSchemaMongoCompatible = <
  TTool extends ToolWithInputSchema,
>(
  tool: TTool,
): TTool => {
  if (compatibleTools.has(tool) || !tool.inputSchema) {
    return tool;
  }

  const standard = tool.inputSchema['~standard'];

  tool.inputSchema = {
    '~standard': {
      ...standard,
      jsonSchema: {
        ...standard.jsonSchema,
        input: (options) =>
          omitDialectMarker(standard.jsonSchema.input(options)),
      },
    },
  };

  compatibleTools.add(tool);

  return tool;
};
