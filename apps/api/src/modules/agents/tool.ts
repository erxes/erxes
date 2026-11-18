import { defineTool } from '@earendil-works/pi-durable';
import { z } from 'zod';

interface AgentToolSpec<Input extends z.ZodObject> {
  name: string;
  description: string;
  input: Input;
  execute: (input: z.output<Input>) => unknown;
  /** End the run after this call: the member answers it with their next message. */
  terminate?: boolean;
}

/** A tool whose arguments a zod schema checks; the model reads its result as JSON. */
export const agentTool = <Input extends z.ZodObject>(spec: AgentToolSpec<Input>) =>
  defineTool({
    name: spec.name,
    description: spec.description,
    parameters: z.toJSONSchema(spec.input),
    execute: async (args) => {
      const result: unknown = await spec.execute(spec.input.parse(args));

      return {
        output: [{ type: 'text', text: JSON.stringify(result) ?? 'null' }],
        ...(spec.terminate ? { control: { terminate: true } } : {}),
      };
    },
  });
