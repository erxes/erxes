import { gql } from '@apollo/client';

/**
 * `AgentsTools` — the capabilities catalog read by `/agent/capabilities`.
 * The backend never returns `inputSchema`, only the curated field list.
 */

export const AGENTS_TOOLS = gql`
  query AgentsTools {
    agentsTools {
      tools {
        id
        plugin
        module
        path
        method
        description
        requiresApproval
        inputFields {
          name
          type
          required
        }
      }
      unavailablePlugins
    }
  }
`;

export interface IAgentsToolField {
  name?: string | null;
  type?: string | null;
  required?: boolean | null;
}

export interface IAgentsTool {
  id: string;
  plugin: string;
  module?: string | null;
  path?: string | null;
  method?: string | null;
  description?: string | null;
  requiresApproval: boolean;
  inputFields?: IAgentsToolField[] | null;
}

export interface IAgentsToolsData {
  agentsTools: {
    tools: IAgentsTool[];
    unavailablePlugins: string[];
  } | null;
}
