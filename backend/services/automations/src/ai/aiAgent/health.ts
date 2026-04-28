import { aiAgentInputSchema } from './contract';
import { checkAiProviderHealth } from '../bridge';
import { loadAiAgentContextFiles } from './context';

export type TAiAgentHealthStatus = 'ok' | 'warning' | 'error' | 'skipped';

export type TAiAgentHealth = {
  ready: boolean;
  checkedAt: string;
  errors: string[];
  warnings: string[];
  checks: {
    schema: TAiAgentHealthStatus;
    credentials: TAiAgentHealthStatus;
    files: TAiAgentHealthStatus;
    endpoint: TAiAgentHealthStatus;
    model: TAiAgentHealthStatus;
  };
};

const createHealthState = (): TAiAgentHealth => ({
  ready: false,
  checkedAt: new Date().toISOString(),
  errors: [],
  warnings: [],
  checks: {
    schema: 'ok',
    credentials: 'ok',
    files: 'skipped',
    endpoint: 'skipped',
    model: 'skipped',
  },
});

export const getAiAgentHealth = async (
  subdomain: string,
  agentInput: unknown,
): Promise<TAiAgentHealth> => {
  const health = createHealthState();

  const parsed = aiAgentInputSchema.safeParse(agentInput);

  if (!parsed.success) {
    health.checks.schema = 'error';
    health.checks.credentials = 'error';
    health.errors.push(
      ...parsed.error.issues.map(({ path, message }) => {
        const label = path.length ? path.join('.') : 'agent';
        return `${label}: ${message}`;
      }),
    );
    return health;
  }

  const agent = parsed.data;

  if (!agent.context.files.length) {
    health.checks.files = 'warning';
    health.warnings.push(
      'No context files are attached yet. The agent can still save, but it has no runtime knowledge documents.',
    );
  } else {
    try {
      const loadedContext = await loadAiAgentContextFiles(
        subdomain,
        agent.context.files,
      );

      health.errors.push(...loadedContext.errors);
      health.warnings.push(...loadedContext.warnings);

      if (loadedContext.errors.length) {
        health.checks.files = 'error';
      } else if (loadedContext.warnings.length) {
        health.checks.files = 'warning';
      } else {
        health.checks.files = 'ok';
      }
    } catch (error) {
      health.checks.files = 'error';
      health.errors.push(
        `Failed to validate context files: ${(error as Error).message}`,
      );
    }
  }

  try {
    const providerHealth = await checkAiProviderHealth(agent, subdomain);

    health.checks.credentials = providerHealth.checks.credentials;
    health.checks.endpoint = providerHealth.checks.endpoint;
    health.checks.model = providerHealth.checks.model;
    health.errors.push(...providerHealth.errors);
    health.warnings.push(...providerHealth.warnings);
  } catch (error) {
    health.checks.credentials = 'error';
    health.checks.endpoint = 'error';
    health.errors.push(
      `Failed to resolve AI provider configuration: ${
        (error as Error).message
      }`,
    );
  }

  health.ready = health.errors.length === 0;

  return health;
};
