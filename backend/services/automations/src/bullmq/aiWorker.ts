import { FileEmbeddingService } from '@/ai/fielEmbedding';
import { generateAiAgentMessage } from '@/ai/generateAiAgentMessage';
import { generateModels } from '@/connectionResolver';
import { TAiAgentConfigForm } from '@/types/aiAgentAction';
import { Job } from 'bullmq';
import { AUTOMATION_EXECUTION_STATUS } from 'erxes-api-shared/core-modules';
import { getEnv, sanitizeKey } from 'erxes-api-shared/utils';

// Worker for AI training
export const startAiTraining = async (job: Job) => {
  const { data, subdomain } = job.data;
  const { agentId } = data;
  const models = await generateModels(subdomain);
  const bucketName = getEnv({ name: 'R2_BUCKET_NAME' });

  // Get AI agent with files
  const agent = await models.AiAgents.findById({ _id: agentId });
  if (!agent) {
    throw new Error('AI Agent not found');
  }

  const files = agent.files;
  if (files.length === 0) {
    throw new Error('No files found for training');
  }

  // Clear existing embeddings for this agent
  await models.AiEmbeddings.deleteMany({
    fileId: { $in: files.map(({ id }) => id) },
  });

  const fileEmbeddingService = new FileEmbeddingService();
  let processedFiles = 0;

  // Process each file
  for (const { id, key, name } of files) {
    try {
      // Create embedding for the file
      const fileEmbedding = await fileEmbeddingService.embedUploadedFile(
        models,
        sanitizeKey(key),
      );

      // Store in database
      await models.AiEmbeddings.create({
        fileId: id,
        fileName: name,
        key,
        bucket: bucketName,
        fileContent: fileEmbedding.fileContent,
        embedding: fileEmbedding.embedding,
        embeddingModel: 'bge-large-en-v1.5',
        dimensions: fileEmbedding.embedding.length,
      });

      processedFiles++;
    } catch (error) {
      console.error(`Failed to process file :`, error);
      // Continue with other files
    }
  }

  return {
    agentId,
    totalFiles: files.length,
    processedFiles,
    status: processedFiles === files.length ? 'completed' : 'failed',
    error:
      processedFiles < files.length
        ? 'Some files failed to process'
        : undefined,
  };
};

// Worker for AI execution (automation actions)
export const executeAiAgent = async (job: Job) => {
  const { data = {}, subdomain } = job.data;
  const { aiAgentActionId, executionId, actionId, inputData, triggerData } =
    data;

  const models = await generateModels(subdomain);

  const execution = await models.Executions.findOne({
    _id: executionId,
  }).lean();
  if (!execution) {
    throw new Error('Execution not found');
  }
  const automation = await models.Automations.findOne({
    _id: execution.automationId,
    status: AUTOMATION_EXECUTION_STATUS.ACTIVE,
  }).lean();

  if (!automation) {
    throw new Error('Automation not found');
  }

  const action = (automation.actions || []).find(({ id }) => id === actionId);
  if (!action) {
    throw new Error('AI Agent Action not found');
  }

  const actionConfig = (action.config || {}) as TAiAgentConfigForm;

  const aiAgent = await models.AiAgents.findOne({
    _id: actionConfig.aiAgentId,
  });
  if (!aiAgent) {
    throw new Error('Ai Agent not found');
  }

  const userInput = inputData || triggerData?.text || '';

  // Prepare data based on goal type
  const jobData: any = {
    agentId: aiAgent._id,
    userInput,
    agentConfig: aiAgent.config,
  };

  if (actionConfig.goalType === 'generateText') {
    jobData.textPrompt = actionConfig.prompt;
  }

  if (actionConfig.goalType === 'classifyTopic') {
    jobData.topics = actionConfig.topics;
  }

  if (actionConfig.goalType === 'generateObject') {
    jobData.objectFields = actionConfig.objectFields;
  }

  return {
    executionId,
    actionId,
    aiAgentActionId,
    jobData,
  };
};

export const aiMessageGenerationWorker = async (job: Job) => {
  const { data, subdomain } = job.data;
  const { agentId, question } = data;
  const models = await generateModels(subdomain);
  const message = await generateAiAgentMessage(models, question, agentId);
  return message;
};

export const aiWorker = async (job: Job) => {
  const name = job.name;
  switch (name) {
    case 'generateText':
      return aiMessageGenerationWorker(job);
    case 'executeAiAgent':
      return executeAiAgent(job);
    case 'trainAiAgent':
      return startAiTraining(job);
    default:
      throw new Error(`Unknown job name: ${name}`);
  }
};
