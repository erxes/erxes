import { getAiAgentHealth, parseAiAgentInput, runAiAction } from '../ai';
import { Job } from 'bullmq';
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

// Worker for AI execution (automation actions)
export const executeAiAgent = async (job: Job) => {
  const { data = {}, subdomain } = job.data;
  const { actionConfig, inputData, aiContext, memory } = data;
  const models = await generateModels(subdomain);

  const aiAgentId = actionConfig?.aiAgentId;

  if (!aiAgentId) {
    throw new Error('AI action config is missing aiAgentId.');
  }

  const agent = await models.AiAgents.findById({ _id: aiAgentId }).lean();

  if (!agent) {
    throw new Error('AI Agent not found');
  }

  return await runAiAction({
    subdomain,
    agent: parseAiAgentInput(agent),
    actionConfig,
    inputData,
    aiContext,
    memory,
  });
};

export const aiWorker = async (job: Job) => {
  const name = job.name;
  switch (name) {
    case 'checkAiAgentHealth':
      return checkAiAgentHealthWorker(job);
    case 'executeAiAgent':
      return executeAiAgent(job);
    default:
      throw new Error(`Unknown job name: ${name}`);
  }
};
