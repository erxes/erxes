import { detectConversationType } from '@/ai/detectConversationType';
import { FileEmbeddingService } from '@/ai/fielEmbedding';
import { IModels } from '@/connectionResolver';

export const generateAiAgentMessage = async (
  models: IModels,
  question: string,
  agentId: string,
) => {
  const fileEmbeddingService = new FileEmbeddingService();

  const agent = await models.AiAgents.findById(agentId);
  if (!agent) {
    throw new Error('AI Agent not found');
  }
  const isGeneralConversation = await detectConversationType(question);

  if (isGeneralConversation) {
    // Use agent's prompt and instructions for general conversation
    const message = await fileEmbeddingService.generateGeneralResponse(
      agent.prompt || '',
      agent.instructions || '',
      question,
    );

    return {
      message,
      relevantFile: null,
      similarity: 0,
    };
  } else {
    // Use file embeddings for specific questions
    const files = agent.files || [];
    const fileIds = files.map((f) => f.id).filter(Boolean);

    if (fileIds.length === 0) {
      return {
        message:
          "I don't have any files to reference for this question. Please upload files and start training, or ask me a general question.",
        relevantFile: null,
        similarity: 0,
      };
    }

    const fileEmbeddings = await models.AiEmbeddings.find({
      fileId: { $in: fileIds },
    });

    if (fileEmbeddings.length === 0) {
      return {
        message:
          "I don't have any trained files to reference for this question. Please start AI training first, or ask me a general question.",
        relevantFile: null,
        similarity: 0,
      };
    }

    // Convert to IFileEmbedding format
    const embeddings = fileEmbeddings.map((embedding) => ({
      fileId: embedding.fileId,
      fileName: embedding.fileName,
      fileContent: embedding.fileContent,
      embedding: embedding.embedding,
      createdAt: embedding.createdAt,
    }));

    // Generate agent message based on files
    const message = await fileEmbeddingService.generateAgentMessage(
      embeddings,
      question,
    );

    return {
      message,
      relevantFile: fileEmbeddings[0]?.fileName || null,
      similarity: 0.8,
    };
  }
};
