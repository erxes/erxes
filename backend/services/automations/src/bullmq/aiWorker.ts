import {
  AI_AGENT_SUPPORTED_PROVIDERS,
  aiAgentInputSchema,
  getAiAgentHealth,
  getAiAgentKnowledgeSourceStatuses,
  indexAiAgentKnowledgeFiles,
  indexKnowledgeDocument,
  listAiAgentModels,
  parseAiAgentInput,
  refreshAiKnowledgeSource,
  removeKnowledgeDocument,
  syncAiAgentKnowledgeSources,
  syncAiKnowledgeSourceScope,
} from '../ai';
import type { TAiAgentProvider } from '../ai';
import type {
  TAiKnowledgeSourceReference,
  TKnowledgeIndexJob,
} from 'erxes-api-shared/utils';
import type { Job } from 'bullmq';
import { generateModels } from '../connectionResolver';

export const checkAiAgentHealthWorker = async (job: Job) => {
  const { data, subdomain } = job.data;
  const { agentId } = data;
  const models = await generateModels(subdomain);

  const agent = await models.AiAgents.findById({ _id: agentId }).lean();
  if (!agent) {
    throw new Error('AI Agent not found');
  }

  return await getAiAgentHealth(subdomain, agent);
};

const isAiAgentProvider = (value: unknown): value is TAiAgentProvider =>
  AI_AGENT_SUPPORTED_PROVIDERS.some((provider) => provider === value);

export const listAiAgentModelsWorker = async (job: Job) => {
  const { data, subdomain } = job.data;
  const { agentId, provider, selectedModel } = data;

  if (!isAiAgentProvider(provider)) {
    throw new Error(`Unsupported AI provider "${provider}"`);
  }

  const models = await generateModels(subdomain);
  const agent = agentId
    ? await models.AiAgents.findById({ _id: agentId }).lean()
    : null;
  // An agent that no longer validates still gets the catalog list.
  const parsed = agent ? aiAgentInputSchema.safeParse(agent) : null;

  return await listAiAgentModels({
    subdomain,
    storedAgent: parsed?.success ? parsed.data : null,
    provider,
    selectedModel,
  });
};

export const indexAiAgentKnowledgeWorker = async (job: Job) => {
  const { data, subdomain } = job.data;
  const { agentId, fileId } = data;
  const models = await generateModels(subdomain);

  const agent = await models.AiAgents.findById({ _id: agentId }).lean();

  const parsedAgent = agent ? parseAiAgentInput(agent) : null;
  const sourceSyncResult = fileId
    ? { status: 'skipped' as const, reason: 'file-only reindex' }
    : await syncAiAgentKnowledgeSources({
        models,
        subdomain,
        agentId,
        sources: parsedAgent?.context.knowledgeSources || [],
      });

  if (!parsedAgent) {
    await models.KnowledgeChunks.deleteMany({ agentId });
    return { sourceSyncResult, status: 'removed' as const };
  }

  const fileIndexResult = await indexAiAgentKnowledgeFiles({
    models,
    subdomain,
    agentId,
    files: fileId
      ? parsedAgent.context.files.filter((file) => file.id === fileId)
      : parsedAgent.context.files,
  });

  return { fileIndexResult, sourceSyncResult };
};

export const indexKnowledgeDocumentWorker = async (
  job: Job<{ subdomain: string; data: TKnowledgeIndexJob }>,
) => {
  const { data, subdomain } = job.data;
  const models = await generateModels(subdomain);

  if (data.operation === 'remove') {
    return removeKnowledgeDocument({
      models,
      source: data.source,
    });
  }

  return indexKnowledgeDocument({
    models,
    document: data.document,
  });
};

export const refreshAiKnowledgeSourceWorker = async (
  job: Job<{
    subdomain: string;
    data: { source: TAiKnowledgeSourceReference };
  }>,
) => {
  const { data, subdomain } = job.data;
  const models = await generateModels(subdomain);

  return refreshAiKnowledgeSource({
    models,
    subdomain,
    source: data.source,
  });
};

export const getAiAgentKnowledgeSourceStatusesWorker = async (
  job: Job<{ subdomain: string; data: { agentId: string } }>,
) => {
  const { data, subdomain } = job.data;
  const models = await generateModels(subdomain);

  return getAiAgentKnowledgeSourceStatuses({
    models,
    agentId: data.agentId,
  });
};

export const syncAiKnowledgeSourceScopeWorker = async (
  job: Job<{ subdomain: string; data: { runId: string } }>,
) => {
  const { data, subdomain } = job.data;
  const models = await generateModels(subdomain);

  return syncAiKnowledgeSourceScope({
    models,
    subdomain,
    runId: data.runId,
  });
};

export const aiWorker = async (job: Job) => {
  const name = job.name;
  switch (name) {
    case 'checkAiAgentHealth':
      return checkAiAgentHealthWorker(job);
    case 'listAiAgentModels':
      return listAiAgentModelsWorker(job);
    case 'indexAiAgentKnowledge':
      return indexAiAgentKnowledgeWorker(job);
    case 'indexKnowledgeDocument':
      return indexKnowledgeDocumentWorker(job);
    case 'refreshAiKnowledgeSource':
      return refreshAiKnowledgeSourceWorker(job);
    case 'syncAiKnowledgeSourceScope':
      return syncAiKnowledgeSourceScopeWorker(job);
    case 'getAiAgentKnowledgeSourceStatuses':
      return getAiAgentKnowledgeSourceStatusesWorker(job);
    default:
      throw new Error(`Unknown job name: ${name}`);
  }
};
