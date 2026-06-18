import { z } from 'zod';

export const agentFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  agentId: z.string().min(1, 'Agent ID is required'),
  description: z.string(),
  instructions: z.string().min(1, 'System instructions are required'),
  provider: z.string(),
  model: z.string().min(1, 'Model is required'),
  toolPolicy: z.enum(['all', 'custom']),
  allowedTools: z.array(z.string()),
  destructiveOps: z.enum(['allow', 'ask']),
  memoryEnabled: z.boolean(),
  maxSteps: z.number().int().min(1).max(50),
  temperature: z.number().nullable(),
  isEnabled: z.boolean(),
});

export type AgentFormValues = z.infer<typeof agentFormSchema>;

export const AGENT_FORM_DEFAULTS: AgentFormValues = {
  name: '',
  agentId: '',
  description: '',
  instructions: '',
  provider: '',
  model: '',
  toolPolicy: 'all',
  allowedTools: [],
  destructiveOps: 'ask',
  memoryEnabled: true,
  maxSteps: 10,
  temperature: null,
  isEnabled: true,
};
