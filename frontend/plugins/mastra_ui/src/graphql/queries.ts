import { gql } from '@apollo/client';

export const MASTRA_AGENTS = gql`
  query MastraAgents {
    mastraAgents {
      _id name agentId description instructions provider model
      toolIds memoryEnabled maxSteps isEnabled createdAt updatedAt
    }
  }
`;

export const MASTRA_AGENT = gql`
  query MastraAgent($_id: String!) {
    mastraAgent(_id: $_id) {
      _id name agentId description instructions provider model
      toolIds memoryEnabled maxSteps isEnabled createdAt updatedAt
    }
  }
`;

export const MASTRA_AGENT_CHAT = gql`
  query MastraAgentChat($agentId: String!, $message: String!, $threadId: String) {
    mastraAgentChat(agentId: $agentId, message: $message, threadId: $threadId)
  }
`;

export const MASTRA_TOOLS = gql`
  query MastraTools {
    mastraTools {
      _id toolId name description type builtinType
      erxesPlugin erxesOperation erxesOperationType graphqlArgs isEnabled createdAt
    }
  }
`;

export const MASTRA_TOOL = gql`
  query MastraTool($_id: String!) {
    mastraTool(_id: $_id) {
      _id toolId name description type builtinType
      erxesPlugin erxesOperation erxesOperationType graphqlArgs
      erxesReturnType erxesResponseFields isEnabled createdAt
    }
  }
`;

export const MASTRA_AVAILABLE_ERXES_TOOLS = gql`
  query MastraAvailableErxesTools {
    mastraAvailableErxesTools {
      plugin operation operationType description graphqlArgs returnType
    }
  }
`;

export const MASTRA_PROVIDERS = gql`
  query MastraProviders {
    mastraProviders {
      _id provider label apiKey baseUrl isDefault isEnabled
      isOpenAICompatible modelsEndpoint envKey headers createdAt
    }
  }
`;

export const MASTRA_PROVIDER_CATALOG = gql`
  query MastraProviderCatalog {
    mastraProviderCatalog {
      provider label isOpenAICompatible isConfigured
    }
  }
`;

export const MASTRA_PROVIDER_PRESETS = gql`
  query MastraProviderPresets {
    mastraProviderPresets {
      provider label isOpenAICompatible envKey baseUrl modelsEndpoint headers
      models { id name }
    }
  }
`;

export const MASTRA_PROVIDER_MODELS = gql`
  query MastraProviderModels($provider: String!) {
    mastraProviderModels(provider: $provider) {
      id name
    }
  }
`;

export const MASTRA_SETTINGS = gql`
  query MastraSettings {
    mastraSettings {
      _id erxesApiUrl erxesApiToken defaultAgentId memoryDbPath
    }
  }
`;
