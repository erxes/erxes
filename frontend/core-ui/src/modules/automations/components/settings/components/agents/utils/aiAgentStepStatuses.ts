import {
  AI_AGENT_STATUS_SEVERITY,
  AI_AGENT_STEP_META,
  AI_AGENT_STEPS,
  TAiAgentStep,
  TAiAgentStepState,
  TAiAgentStepStatus,
} from '@/automations/components/settings/components/agents/constants/aiAgentSteps';
import {
  AI_AGENT_PROVIDERS_REQUIRING_API_KEY,
  TAiAgentProvider,
} from '@/automations/components/settings/components/agents/constants/providers';
import { TAiAgentHealth } from '@/automations/components/settings/components/agents/hooks/useAiAgentHealth';
import { TAiAgentForm } from '@/automations/components/settings/components/agents/states/AiAgentFormSchema';
import { hasSourceSelection } from '@/automations/components/settings/components/agents/utils/aiAgentKnowledgeSources';
import { DeepPartial } from 'react-hook-form';
import { TAiKnowledgeSourceIndexStatus } from 'ui-modules';

export type TAiAgentStepStates = Record<TAiAgentStep, TAiAgentStepState>;

export type TAiAgentStepStatusInput = {
  values: DeepPartial<TAiAgentForm>;
  isEditing: boolean;
  usageTotal?: number;
  hasStoredApiKey: boolean;
  health?: TAiAgentHealth;
  healthLoading: boolean;
  knowledgeStatuses: TAiKnowledgeSourceIndexStatus[];
  // A new agent starts from provider defaults; they count once the user
  // has touched the step, so an unsaved agent never looks pre-assembled.
  untouched: { connection: boolean; brain: boolean };
};

const unlessUntouched = (
  state: TAiAgentStepState,
  untouched: boolean,
  message: string,
): TAiAgentStepState =>
  untouched && state.status !== 'error'
    ? { status: 'missing', message }
    : state;

// Mirrors the reasoning and timeout rules of buildAiAgentRuntimeSummary that
// depend on the agent alone, not on a particular automation action.
const REASONING_MODEL_MIN_MAX_TOKENS = 2000;
const SLOW_CONTEXT_BYTES = 25_000;
const SLOW_PROMPT_CHARS = 1_000;
const SHORT_TIMEOUT_MS = 15_000;

const getIdentityState = ({
  values,
  isEditing,
  usageTotal,
}: TAiAgentStepStatusInput): TAiAgentStepState => {
  if (!values.name?.trim()) {
    return { status: 'missing', message: 'Give it a name' };
  }

  if (!values.description?.trim()) {
    return {
      status: 'hint',
      message: 'Who am I?',
      detail:
        'Add a description so teammates know when to pick this agent inside an automation.',
    };
  }

  if (isEditing && !usageTotal) {
    return {
      status: 'hint',
      message: 'No automation uses me yet',
      detail: 'Add this agent to an automation action to put it to work.',
    };
  }

  return { status: 'done' };
};

const getConnectionChecks = ({
  values,
  hasStoredApiKey,
  health,
}: TAiAgentStepStatusInput): TAiAgentStepState => {
  const checks = health?.checks || {};
  const provider = values.connection?.provider as TAiAgentProvider | undefined;

  if (checks.credentials === 'error' || checks.endpoint === 'error') {
    return {
      status: 'error',
      message: 'Signal lost',
      detail:
        health?.errors?.[0] ||
        'The provider rejected the last check. Replace the key or fix the endpoint, then save.',
    };
  }

  if (
    provider &&
    AI_AGENT_PROVIDERS_REQUIRING_API_KEY.includes(provider) &&
    !values.connection?.config?.apiKey?.trim() &&
    !hasStoredApiKey
  ) {
    return { status: 'missing', message: 'Needs an API key' };
  }

  if (checks.credentials === 'warning' || checks.endpoint === 'warning') {
    return {
      status: 'warning',
      message: 'Weak signal',
      detail: health?.warnings?.[0],
    };
  }

  return { status: 'done' };
};

const getConnectionState = (
  input: TAiAgentStepStatusInput,
): TAiAgentStepState =>
  unlessUntouched(
    getConnectionChecks(input),
    !input.isEditing && input.untouched.connection,
    'Choose a provider',
  );

const getBrainChecks = (input: TAiAgentStepStatusInput): TAiAgentStepState => {
  const { values, health } = input;
  const model = values.connection?.model?.trim() || '';
  const maxTokens = values.runtime?.maxTokens ?? 0;
  const timeoutMs = values.runtime?.timeoutMs ?? 0;
  const contextBytes = (values.context?.files || []).reduce(
    (total, file) => total + (file?.size || 0),
    0,
  );
  const promptChars = values.context?.systemPrompt?.trim().length || 0;

  if (health?.checks?.model === 'error') {
    return {
      status: 'error',
      message: "Can't reach the model",
      detail:
        'The provider did not accept this model. Pick another one or check access on the provider side.',
    };
  }

  // Models come from the provider, so the brain waits for the connection.
  if (!model || getConnectionState(input).status === 'missing') {
    return { status: 'missing', message: 'Pick a model' };
  }

  if (
    model.toLowerCase().startsWith('gpt-5') &&
    maxTokens < REASONING_MODEL_MIN_MAX_TOKENS
  ) {
    return {
      status: 'warning',
      message: 'Too few tokens to think',
      detail:
        'GPT-5 models spend part of the budget reasoning before they answer. Pick a larger budget or raise max tokens above 2,000.',
    };
  }

  if (
    timeoutMs <= SHORT_TIMEOUT_MS &&
    (contextBytes >= SLOW_CONTEXT_BYTES || promptChars >= SLOW_PROMPT_CHARS)
  ) {
    return {
      status: 'warning',
      message: 'Too slow…',
      detail:
        'Long instructions or large files may not finish within 15 seconds on slower providers. Pick a larger budget or trim the context.',
    };
  }

  if (health?.checks?.model === 'warning') {
    return {
      status: 'warning',
      message: 'Model answered with warnings',
      detail: health.warnings?.[0],
    };
  }

  return { status: 'done' };
};

const getMemoryState = ({
  values,
  health,
  knowledgeStatuses,
}: TAiAgentStepStatusInput): TAiAgentStepState => {
  const files = values.context?.files || [];
  const sources = values.context?.knowledgeSources || [];
  const failedCount =
    files.filter((file) => file?.status === 'failed').length +
    knowledgeStatuses.filter((status) => status.status === 'failed').length;

  if (health?.checks?.files === 'error') {
    return {
      status: 'error',
      message: "Can't read my files",
      detail:
        'Context files could not be loaded. Re-upload or remove the broken file.',
    };
  }

  if (failedCount) {
    return {
      status: 'warning',
      message: `Can't read ${failedCount} item${failedCount === 1 ? '' : 's'}`,
      detail:
        'Some files or records failed to index and are never searched. Open the marked items to fix or retry them.',
    };
  }

  if (
    sources.some(
      (source) =>
        !source ||
        !hasSourceSelection({
          scope: source.scope,
          sourceIds: (source.sourceIds || []).filter(
            (id): id is string => !!id,
          ),
          config: source.config || {},
        }),
    )
  ) {
    return {
      status: 'warning',
      message: 'A source has nothing selected',
      detail: 'A source with nothing selected is never indexed or searched.',
    };
  }

  if (
    !values.context?.systemPrompt?.trim() &&
    !files.length &&
    !sources.length
  ) {
    return { status: 'missing', message: 'Nothing to remember yet' };
  }

  return { status: 'done' };
};

const getTestState = ({
  isEditing,
  health,
  healthLoading,
}: TAiAgentStepStatusInput): TAiAgentStepState => {
  if (!isEditing) {
    return { status: 'missing', message: 'Save me to run a check' };
  }

  if (healthLoading || !health) {
    return { status: 'pending' };
  }

  if (health.errors?.length) {
    return {
      status: 'error',
      message: 'Check failed',
      detail: health.errors[0],
    };
  }

  if (health.warnings?.length || !health.ready) {
    return {
      status: 'warning',
      message: 'Check passed with warnings',
      detail: health.warnings?.[0],
    };
  }

  return { status: 'done' };
};

const getBrainState = (input: TAiAgentStepStatusInput): TAiAgentStepState =>
  unlessUntouched(
    getBrainChecks(input),
    !input.isEditing && input.untouched.brain,
    'Pick a model',
  );

export const getAiAgentStepStates = (
  input: TAiAgentStepStatusInput,
): TAiAgentStepStates => ({
  identity: getIdentityState(input),
  connection: getConnectionState(input),
  brain: getBrainState(input),
  memory: getMemoryState(input),
  test: getTestState(input),
});

export type TAiAgentHeadline = {
  status: TAiAgentStepStatus;
  step: TAiAgentStep;
  label: string;
  cta: string;
  issueCount: number;
};

const MISSING_CTA: Record<TAiAgentStep, string> = {
  identity: 'Add a name',
  connection: 'Connect provider',
  brain: 'Pick a model',
  memory: 'Add memory',
  test: 'Run check',
};

// Hints never block, so the headline only escalates for missing parts and up.
export const getAiAgentHeadline = (
  states: TAiAgentStepStates,
): TAiAgentHeadline => {
  const worstStep = AI_AGENT_STEPS.reduce((worst, step) =>
    AI_AGENT_STATUS_SEVERITY[states[step].status] >
    AI_AGENT_STATUS_SEVERITY[states[worst].status]
      ? step
      : worst,
  );
  const status = states[worstStep].status;
  const stepLabel = AI_AGENT_STEP_META[worstStep].label.toLowerCase();
  const issueCount = AI_AGENT_STEPS.filter((step) =>
    ['error', 'warning'].includes(states[step].status),
  ).length;

  if (status === 'error') {
    return {
      status,
      step: worstStep,
      label: `${AI_AGENT_STEP_META[worstStep].label} failed`,
      cta: `Fix ${stepLabel}`,
      issueCount,
    };
  }

  if (status === 'warning') {
    return {
      status,
      step: worstStep,
      label: `${issueCount} issue${issueCount === 1 ? '' : 's'}`,
      cta: `Review ${stepLabel}`,
      issueCount,
    };
  }

  if (status === 'missing') {
    return {
      status,
      step: worstStep,
      label: 'Assembling',
      cta: MISSING_CTA[worstStep],
      issueCount,
    };
  }

  return {
    status: status === 'pending' ? 'pending' : 'done',
    step: 'test',
    label: status === 'pending' ? 'Checking' : 'Ready',
    cta: 'Run check',
    issueCount,
  };
};
