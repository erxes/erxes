import { makeToolInputSchemaMongoCompatible } from '@/agents/toolSchemaCompatibility';

describe('makeToolInputSchemaMongoCompatible', () => {
  it('omits only the optional dialect marker from model-facing input schemas', async () => {
    let conversionTarget: string | undefined;
    const convertInput = jest.fn((options: { target: string }) => {
      conversionTarget = options.target;

      return {
        type: 'object',
        properties: { answer: { type: 'string' } },
        required: ['answer'],
        $schema: 'http://json-schema.org/draft-07/schema#',
      };
    });
    const tool = makeToolInputSchemaMongoCompatible({
      inputSchema: {
        '~standard': {
          version: 1,
          vendor: 'test',
          validate: (value) => ({ value }),
          jsonSchema: {
            input: convertInput,
            output: () => ({ type: 'object' }),
          },
        },
      },
    });

    const inputSchema = tool.inputSchema?.['~standard'].jsonSchema.input({
      target: 'draft-07',
    });
    const validation = await tool.inputSchema?.['~standard'].validate('yes');

    expect(inputSchema).toEqual({
      type: 'object',
      properties: { answer: { type: 'string' } },
      required: ['answer'],
    });
    expect(validation).toEqual({ value: 'yes' });
    expect(conversionTarget).toBe('draft-07');
  });

  it('wraps a cached tool only once', () => {
    const tool = makeToolInputSchemaMongoCompatible({
      inputSchema: {
        '~standard': {
          version: 1,
          vendor: 'test',
          validate: (value) => ({ value }),
          jsonSchema: {
            input: () => ({ type: 'object' }),
            output: () => ({ type: 'object' }),
          },
        },
      },
    });
    const compatibleSchema = tool.inputSchema;

    makeToolInputSchemaMongoCompatible(tool);

    expect(tool.inputSchema).toBe(compatibleSchema);
  });
});
