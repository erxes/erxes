import { embedTextCFChunks } from '@/ai/embedTextCFChunks';
import { generateTextCF } from '@/ai/generateTextCF';
import {
  getPropmtMessageTemplate,
  getObjectGenerationPrompt,
} from '@/ai/propmts';
import { getFileAsStringFromCF } from '@/utils/cloudflare';
import { getEnv } from 'erxes-api-shared/utils';
export interface IFileEmbedding {
  fileId: string;
  fileName: string;
  fileContent: string;
  embedding: number[];
  createdAt: Date;
}

export interface IAiAgentTopic {
  id: string;
  topicName: string;
  prompt: string;
}

export interface IAiAgentObjectField {
  id: string;
  fieldName: string;
  prompt: string;
  dataType: 'string' | 'number' | 'boolean' | 'object' | 'array';
  validation: string;
}

export interface IGeneratedObject {
  [key: string]: any;
}

export class FileEmbeddingService {
  /**
   * Embed uploaded file content and store for AI agent use
   */
  async embedUploadedFile(
    models: any,
    key: string,
    fileName?: string,
  ): Promise<IFileEmbedding> {
    try {
      // Get file content from Cloudflare R2
      const CLOUDFLARE_BUCKET_NAME = getEnv({ name: 'CLOUDFLARE_BUCKET_NAME' });
      const fileContent = await getFileAsStringFromCF(
        CLOUDFLARE_BUCKET_NAME,
        key,
      );

      // Generate embedding for the file content
      const embedding = await embedTextCFChunks(fileContent);

      return {
        fileId: key,
        fileName: fileName || key,
        fileContent,
        embedding,
        createdAt: new Date(),
      };
    } catch (error) {
      throw new Error(`Failed to embed file: ${error.message}`);
    }
  }

  /**
   * Generate AI agent message based on file content and user query
   */
  async generateAgentMessage(
    fileEmbeddings: IFileEmbedding[],
    userQuery: string,
  ): Promise<string> {
    try {
      // Use Cloudflare AI for advanced semantic search and response generation
      const response = await this.generateAdvancedResponse(
        fileEmbeddings,
        userQuery,
      );
      return response;
    } catch (error) {
      throw new Error(`Failed to generate agent message: ${error.message}`);
    }
  }

  /**
   * Classify user query to determine topic for flow splitting
   * Returns the most relevant topic ID
   */
  async classifyUserQueryForFlow(
    userQuery: string,
    topics: IAiAgentTopic[],
  ): Promise<string> {
    try {
      if (!topics || topics.length === 0) {
        throw new Error('No topics provided for classification');
      }

      const topicId = await this.generateReponceUsingTopics(userQuery, topics);

      return topicId;
    } catch (error) {
      throw new Error(
        `Failed to classify user query for flow: ${error.message}`,
      );
    }
  }

  /**
   * Generate structured object data based on user query and defined object fields
   * Returns a structured object with the specified fields
   */
  async generateObjectFromQuery(
    userQuery: string,
    objectFields: IAiAgentObjectField[],
  ): Promise<IGeneratedObject> {
    try {
      if (!objectFields || objectFields.length === 0) {
        throw new Error('No object fields provided for generation');
      }

      const generatedObject = await this.generateObjectUsingFields(
        userQuery,
        objectFields,
      );

      return generatedObject;
    } catch (error) {
      throw new Error(`Failed to generate object from query: ${error.message}`);
    }
  }

  /**
   * Advanced response generation using Cloudflare AI for semantic search and context retrieval
   */
  private async generateAdvancedResponse(
    fileEmbeddings: IFileEmbedding[],
    userQuery: string,
  ): Promise<string> {
    try {
      // Create a comprehensive prompt for advanced document analysis
      const documentContexts = fileEmbeddings
        .map((embedding, index) => {
          const cleanContent = this.cleanDocumentContent(embedding.fileContent);
          return `Document ${index + 1} (${
            embedding.fileName
          }):\n${cleanContent.substring(0, 1000)}`;
        })
        .join('\n\n');

      const advancedPrompt = getPropmtMessageTemplate(
        documentContexts,
        userQuery,
      );

      const response = await generateTextCF(advancedPrompt);
      return response;
    } catch (error) {
      console.error('Error in advanced response generation:', error);

      // Fallback to simpler approach if advanced method fails
      return await this.generateFallbackResponse(fileEmbeddings, userQuery);
    }
  }

  /**
   * Classify user query against available topics to determine flow direction
   * Returns the most relevant topic ID for flow splitting
   */
  private async generateReponceUsingTopics(
    userQuery: string,
    topics: IAiAgentTopic[],
  ): Promise<string> {
    try {
      // Create topic classification prompt without documents
      const topicClassificationPrompt = this.createTopicClassificationPrompt(
        userQuery,
        topics,
      );

      // Generate response using Cloudflare AI
      const response = await generateTextCF(topicClassificationPrompt);

      // Parse the response to extract topic ID
      const topicId = this.extractTopicIdFromResponse(response, topics);

      return topicId;
    } catch (error) {
      console.error('Error in topic classification:', error);

      // Fallback to first topic if classification fails
      return topics.length > 0 ? topics[0].id : '';
    }
  }

  /**
   * Generate structured object data using defined fields
   * Returns a structured object with the specified fields populated
   */
  private async generateObjectUsingFields(
    userQuery: string,
    objectFields: IAiAgentObjectField[],
  ): Promise<IGeneratedObject> {
    try {
      // Create object generation prompt using centralized prompt function
      const objectGenerationPrompt = getObjectGenerationPrompt(
        userQuery,
        objectFields,
      );

      // Generate response using Cloudflare AI
      const response = await generateTextCF(objectGenerationPrompt);

      // Parse the response to extract structured object
      const generatedObject = this.extractObjectFromResponse(
        response,
        objectFields,
      );

      return generatedObject;
    } catch (error) {
      console.error('Error in object generation:', error);

      // Fallback to empty object with default values
      return this.createFallbackObject(objectFields);
    }
  }

  /**
   * Create a prompt for topic classification based on user query and available topics
   */
  private createTopicClassificationPrompt(
    userQuery: string,
    topics: IAiAgentTopic[],
  ): string {
    const topicsList = topics
      .map(
        (topic, index) =>
          `${index + 1}. ID: ${topic.id}, Name: ${
            topic.topicName
          }, Description: ${topic.prompt}`,
      )
      .join('\n');

    return `You are an enterprise-grade AI assistant that specializes in topic classification for workflow routing. Your task is to analyze the user's query against available topics to determine the most relevant topic for flow splitting.

Available Topics:
${topicsList}

User Query: "${userQuery}"

Instructions:
1. Analyze the user query to understand their intent and the type of information they're seeking
2. Match the query against the available topics based on:
   - Topic name relevance
   - Topic description/prompt alignment
   - User intent and context
3. Select the most relevant topic ID that best matches the user's query
4. Consider the semantic meaning and context of the query

Your response should be in the following format:
TOPIC_ID: [selected topic ID]

Please analyze and respond with only the topic ID:`;
  }

  /**
   * Extract topic ID from AI response
   */
  private extractTopicIdFromResponse(
    response: string,
    topics: IAiAgentTopic[],
  ): string {
    try {
      // Look for TOPIC_ID: pattern in the response
      const topicIdMatch = response.match(/TOPIC_ID:\s*([^\n\r]+)/i);
      if (topicIdMatch) {
        const extractedId = topicIdMatch[1].trim();
        // Validate that the extracted ID exists in the topics array
        const validTopic = topics.find((topic) => topic.id === extractedId);
        if (validTopic) {
          return extractedId;
        }
      }

      // Fallback: try to find topic ID by matching topic names in the response
      for (const topic of topics) {
        if (
          response.toLowerCase().includes(topic.topicName.toLowerCase()) ||
          response.toLowerCase().includes(topic.id.toLowerCase())
        ) {
          return topic.id;
        }
      }

      // If no topic found, return the first topic as fallback
      return topics.length > 0 ? topics[0].id : '';
    } catch (error) {
      console.error('Error extracting topic ID from response:', error);
      return topics.length > 0 ? topics[0].id : '';
    }
  }

  /**
   * Extract structured object from AI response
   */
  private extractObjectFromResponse(
    response: string,
    objectFields: IAiAgentObjectField[],
  ): IGeneratedObject {
    try {
      // Try to find JSON object in the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonString = jsonMatch[0];
        const parsedObject = JSON.parse(jsonString);

        // Validate and convert types according to field definitions
        const validatedObject = this.validateAndConvertObject(
          parsedObject,
          objectFields,
        );
        return validatedObject;
      }

      // Fallback: create object from field names mentioned in response
      return this.createObjectFromTextResponse(response, objectFields);
    } catch (error) {
      console.error('Error extracting object from response:', error);
      return this.createFallbackObject(objectFields);
    }
  }

  /**
   * Validate and convert object values according to field definitions
   */
  private validateAndConvertObject(
    obj: any,
    objectFields: IAiAgentObjectField[],
  ): IGeneratedObject {
    const validatedObject: IGeneratedObject = {};

    for (const field of objectFields) {
      const value = obj[field.fieldName];

      if (value !== undefined && value !== null && value !== '') {
        validatedObject[field.fieldName] = this.convertValueToType(
          value,
          field.dataType,
        );
      } else {
        // Return undefined for fields not mentioned in the query
        validatedObject[field.fieldName] = undefined;
      }
    }

    return validatedObject;
  }

  /**
   * Convert value to specified data type
   */
  private convertValueToType(value: any, dataType: string): any {
    switch (dataType) {
      case 'string':
        return String(value);
      case 'number':
        const num = Number(value);
        return isNaN(num) ? 0 : num;
      case 'boolean':
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
          return (
            value.toLowerCase() === 'true' || value.toLowerCase() === 'yes'
          );
        }
        return Boolean(value);
      case 'array':
        return Array.isArray(value) ? value : [value];
      case 'object':
        return typeof value === 'object' && value !== null ? value : {};
      default:
        return value;
    }
  }

  /**
   * Create object from text response when JSON parsing fails
   */
  private createObjectFromTextResponse(
    response: string,
    objectFields: IAiAgentObjectField[],
  ): IGeneratedObject {
    const obj: IGeneratedObject = {};

    for (const field of objectFields) {
      // Try to find field value in the response text
      const fieldPattern = new RegExp(
        `${field.fieldName}[\\s:]+([^\\n\\r]+)`,
        'i',
      );
      const match = response.match(fieldPattern);

      if (match && match[1].trim() !== '') {
        obj[field.fieldName] = this.convertValueToType(
          match[1].trim(),
          field.dataType,
        );
      } else {
        // Return undefined for fields not mentioned in the query
        obj[field.fieldName] = undefined;
      }
    }

    return obj;
  }

  /**
   * Create fallback object with undefined values when parsing fails
   */
  private createFallbackObject(
    objectFields: IAiAgentObjectField[],
  ): IGeneratedObject {
    const obj: IGeneratedObject = {};

    for (const field of objectFields) {
      obj[field.fieldName] = undefined;
    }

    return obj;
  }

  /**
   * Fallback response generation for when advanced method fails
   */
  private async generateFallbackResponse(
    fileEmbeddings: IFileEmbedding[],
    userQuery: string,
  ): Promise<string> {
    try {
      // Use Cloudflare AI to find the most relevant document
      const relevancePrompt = `Given the following documents and user question, identify which document is most relevant and extract the key information needed to answer the question.

Documents:
${fileEmbeddings
  .map(
    (embedding, index) =>
      `Document ${index + 1}: ${this.cleanDocumentContent(
        embedding.fileContent,
      ).substring(0, 500)}`,
  )
  .join('\n\n')}

User Question: "${userQuery}"

Please identify the most relevant document and provide a helpful answer based on its content. If no document is relevant, state this clearly.`;

      const response = await generateTextCF(relevancePrompt);
      return response;
    } catch (error) {
      console.error('Error in fallback response generation:', error);
      return "I apologize, but I'm unable to process your question at the moment. Please try again or rephrase your question.";
    }
  }

  /**
   * Clean and process document content for better AI processing
   */
  private cleanDocumentContent(content: string): string {
    // Remove binary markers and XML tags
    let cleanText = content
      .replace(/PK[^\s]*/g, '') // Remove PK markers
      .replace(/<\?xml[^>]*>/g, '') // Remove XML declarations
      .replace(/<[^>]*>/g, '') // Remove all XML tags
      .replace(/[^\w\s.,!?\-()]/g, ' ') // Keep readable characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    // If still too much binary content, try to extract meaningful text
    if (cleanText.length < 50) {
      const readablePattern = /[A-Za-z]{3,}/g;
      const words = cleanText.match(readablePattern);
      if (words && words.length > 0) {
        cleanText = words.join(' ');
      } else {
        cleanText =
          "This appears to be a binary file or document that couldn't be properly extracted.";
      }
    }

    return cleanText;
  }

  /**
   * Generate AI response using Cloudflare AI
   */
  private async generateAIResponse(
    content: string,
    userQuery: string,
  ): Promise<string> {
    try {
      // Create a prompt for the AI model
      const prompt = `Based on the following document content, please answer the user's question in a helpful and informative way. Provide a clear, concise response that directly addresses their question.Document Content:${content.substring(
        0,
        2000,
      )} // Limit content to avoid token limits
      User Question: ${userQuery}

      Please provide a helpful answer based on the document content:`;
      const response = await generateTextCF(prompt);

      return response;
    } catch (error) {
      console.error('Error generating AI response:', error);
      return `I apologize, but I encountered an error while processing your question. Please try again or rephrase your question.`;
    }
  }

  /**
   * Generate general response using agent's prompt and instructions
   */
  async generateGeneralResponse(
    prompt: string,
    instructions: string,
    userQuery: string,
  ): Promise<string> {
    try {
      // Create a context-aware prompt for general conversation
      const systemPrompt = `You are an AI agent with the following characteristics:
          
      ${prompt ? `Agent Prompt: ${prompt}` : ''}
      ${instructions ? `Agent Instructions: ${instructions}` : ''}
          
      Please respond to the user's message in a helpful, friendly, and contextually appropriate way. If the user is greeting you, respond warmly. If they're asking for help, provide assistance based on your capabilities. If they're asking about your role, explain what you can do.
          
      User Message: ${userQuery}
          
      Please provide a natural, conversational response:`;

      const response = await generateTextCF(systemPrompt);
      return response;
    } catch (error) {
      console.error('Error generating general response:', error);

      // Use Cloudflare AI for fallback response as well
      try {
        const fallbackPrompt = `You are a helpful AI agent. The user sent this message: "${userQuery}"

        Please provide a friendly, helpful response. If it's a greeting, respond warmly. If they're asking for help, explain what you can do. If it's unclear, ask how you can help them.
              
        User Message: ${userQuery}
              
        Please provide a natural response:`;

        const fallbackResponse = await generateTextCF(fallbackPrompt);
        return fallbackResponse;
      } catch (fallbackError) {
        console.error('Error generating fallback response:', fallbackError);
        return `Hello! I'm your AI agent. I'm here to help you with questions and tasks. How can I assist you today?`;
      }
    }
  }
}
