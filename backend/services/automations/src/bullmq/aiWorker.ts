import {
  getAiAgentHealth,
  indexAiAgentKnowledgeFiles,
  indexKnowledgeDocument,
  parseAiAgentInput,
  removeKnowledgeDocument,
} from '../ai';
import type { TKnowledgeIndexJob } from 'erxes-api-shared/utils';
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

export const indexAiAgentKnowledgeWorker = async (job: Job) => {
  const { data, subdomain } = job.data;
  const { agentId, fileId } = data;
  const models = await generateModels(subdomain);

  const agent = await models.AiAgents.findById({ _id: agentId }).lean();

  if (!agent) {
    throw new Error('AI Agent not found');
  }

  const parsedAgent = parseAiAgentInput(agent);

  return await indexAiAgentKnowledgeFiles({
    models,
    subdomain,
    agentId,
    files: fileId
      ? parsedAgent.context.files.filter((file) => file.id === fileId)
      : parsedAgent.context.files,
  });
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

export const aiWorker = async (job: Job) => {
  const name = job.name;
  switch (name) {
    case 'checkAiAgentHealth':
      return checkAiAgentHealthWorker(job);
    case 'indexAiAgentKnowledge':
      return indexAiAgentKnowledgeWorker(job);
    case 'indexKnowledgeDocument':
      return indexKnowledgeDocumentWorker(job);
    default:
      throw new Error(`Unknown job name: ${name}`);
  }
};
