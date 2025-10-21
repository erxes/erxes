export const getPropmtMessageTemplate = (
  documentContexts: string,
  userQuery: string,
) => {
  return `
You are an enterprise-grade AI assistant with access to multiple documents. Your task is to provide comprehensive, accurate, and contextually relevant responses based on the available documentation.

Available Documents:
${documentContexts}

User Question: "${userQuery}"

Instructions:
1. Analyze all relevant documents to find the most accurate information
2. If multiple documents contain relevant information, synthesize them coherently
3. If the question cannot be answered from the documents, clearly state this
4. Provide specific, actionable information when possible
5. Cite which document(s) your information comes from
6. If the documents contain conflicting information, acknowledge this
7. Structure your response in a clear, professional manner

Please provide a comprehensive response based on the available documentation:`;
};

export const getTopicClassificationPrompt = (
  userQuery: string,
  topics: Array<{ id: string; topicName: string; prompt: string }>,
) => {
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
};

export const getObjectGenerationPrompt = (
  userQuery: string,
  objectFields: Array<{
    fieldName: string;
    dataType: string;
    prompt: string;
    validation: string;
  }>,
) => {
  const fieldsList = objectFields
    .map(
      (field, index) =>
        `${index + 1}. Field: ${field.fieldName}, Type: ${
          field.dataType
        }, Description: ${field.prompt}, Validation: ${field.validation}`,
    )
    .join('\n');

  return `You are an enterprise-grade AI assistant that specializes in structured data extraction and object generation. Your task is to analyze the user's query and extract relevant information to populate the specified object fields.

Required Object Fields:
${fieldsList}

User Query: "${userQuery}"

Instructions:
1. Analyze the user query to extract relevant information for each field
2. For each field, determine the appropriate value based on:
   - Field description and purpose
   - Data type requirements
   - Validation rules
   - Information available in the user query
3. If information is not available in the query, set the field to null
4. Only extract information that is explicitly mentioned or clearly implied in the user query
5. Ensure all values match the specified data types
6. Follow the validation rules for each field

Your response should be in the following JSON format:
{
  "fieldName1": "extracted_value",
  "fieldName2": extracted_number,
  "fieldName3": true/false,
  "fieldName4": null
}

Please analyze and respond with only the JSON object:`;
};
