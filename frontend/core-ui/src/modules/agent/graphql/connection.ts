import { gql } from '@apollo/client';

/**
 * GraphQL documents for the per-user agents connections (BYOK) surface.
 *
 * Operation names are prefixed with `Agents` to stay unique repo-wide. The
 * backend never returns stored API keys; `hasKey` only reports whether one
 * is stored. Multiple providers may be configured side by side, and
 * `agentsModels` lists each configured provider's usable chat models
 * (fetched server-side from the provider's own /models endpoint, then
 * filtered and ranked) for the chat's model picker.
 */

export const AGENTS_CONNECTIONS = gql`
  query AgentsConnections {
    agentsConnections {
      provider
      model
      hasKey
      isDefault
      updatedAt
    }
  }
`;

export const AGENTS_MODELS = gql`
  query AgentsModels {
    agentsModels {
      provider
      models
      catalog {
        id
        family
        recommended
        name
        thinking {
          kind
          levels
        }
      }
      error
    }
  }
`;

export const AGENTS_CONNECTION_UPSERT = gql`
  mutation AgentsConnectionUpsert($provider: String!, $model: String, $apiKey: String) {
    agentsConnectionUpsert(provider: $provider, model: $model, apiKey: $apiKey) {
      provider
      model
      hasKey
      isDefault
      updatedAt
    }
  }
`;

export const AGENTS_CONNECTION_REMOVE = gql`
  mutation AgentsConnectionRemove($provider: String!) {
    agentsConnectionRemove(provider: $provider)
  }
`;

export const AGENTS_CONNECTION_SET_DEFAULT = gql`
  mutation AgentsConnectionSetDefault($provider: String) {
    agentsConnectionSetDefault(provider: $provider) {
      provider
      model
      hasKey
      isDefault
      updatedAt
    }
  }
`;

export const AGENTS_MODEL_VERIFY = gql`
  mutation AgentsModelVerify($provider: String!, $model: String!) {
    agentsModelVerify(provider: $provider, model: $model) {
      provider
      model
      ok
      error
    }
  }
`;

export interface IAgentsConnectionEntry {
  provider: string;
  model: string;
  hasKey: boolean;
  /** The one entry an unselected chat turn runs on. */
  isDefault?: boolean | null;
  updatedAt?: string | null;
}

export interface IAgentsConnectionsData {
  agentsConnections: IAgentsConnectionEntry[] | null;
}

/**
 * How a model exposes thinking (bundled models.dev data): an effort scale,
 * an on/off toggle, a token budget, always-on reasoning (`fixed`) or none.
 */
export type IAgentsModelThinkingKind =
  | 'effort'
  | 'toggle'
  | 'budget'
  | 'fixed'
  | 'none';

export interface IAgentsModelThinkingData {
  kind: string | null;
  /** Selectable levels, shallowest first; empty for `fixed` and `none`. */
  levels: string[] | null;
}

export interface IAgentsModelInfo {
  id: string;
  /** Generation line such as `gpt-5.6`; empty when unknown. */
  family: string | null;
  /** Part of the provider's short list shown before searching. */
  recommended: boolean | null;
  /** Human name ("GPT-6 Luna"); null shows the raw id. */
  name?: string | null;
  /** Null for models without catalog data (original five levels apply). */
  thinking?: IAgentsModelThinkingData | null;
}

export interface IAgentsProviderModels {
  provider: string;
  /** Usable model ids in ranked order (same order as `catalog`). */
  models: string[] | null;
  catalog: IAgentsModelInfo[] | null;
  /** Key-free reason the provider's listing failed; null on success. */
  error: string | null;
}

export interface IAgentsModelsData {
  agentsModels: IAgentsProviderModels[] | null;
}

export interface IAgentsConnectionUpsertData {
  agentsConnectionUpsert: IAgentsConnectionEntry;
}

export interface IAgentsConnectionUpsertVariables {
  provider: string;
  /** Optional; the server defaults to the provider's model when omitted. */
  model?: string;
  /** Omit to keep this provider's stored key; only send a freshly entered value. */
  apiKey?: string;
}

export interface IAgentsConnectionRemoveData {
  agentsConnectionRemove: boolean;
}

export interface IAgentsConnectionRemoveVariables {
  provider: string;
}

export interface IAgentsConnectionSetDefaultData {
  agentsConnectionSetDefault: IAgentsConnectionEntry[] | null;
}

export interface IAgentsConnectionSetDefaultVariables {
  /** Omit or send '' to clear the explicit default. */
  provider?: string;
}

export interface IAgentsModelVerifyData {
  agentsModelVerify: {
    provider: string;
    model: string;
    ok: boolean | null;
    error: string | null;
  } | null;
}

export interface IAgentsModelVerifyVariables {
  provider: string;
  model: string;
}
