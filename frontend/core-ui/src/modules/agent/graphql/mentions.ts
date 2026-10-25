import { gql } from '@apollo/client';

/**
 * Company search for composer @ mentions. ui-modules keeps its companies
 * hook private, so this reads the same public core `companies` query.
 */
export const AGENTS_MENTION_COMPANIES = gql`
  query AgentsMentionCompanies($searchValue: String, $limit: Int) {
    companies(searchValue: $searchValue, limit: $limit) {
      list {
        _id
        avatar
        primaryName
        names
        primaryEmail
      }
    }
  }
`;

/**
 * Stands in for the plugin search while no plugin provider is available
 * (plugins disabled, permissions missing or still loading). The query is
 * skipped then; an empty GlobalSearch selection would not even parse.
 */
export const AGENTS_MENTION_PLUGIN_SEARCH_IDLE = gql`
  query AgentsMentionPluginSearchIdle {
    __typename
  }
`;

export interface IAgentsMentionCompaniesData {
  companies?: {
    list?: {
      _id: string;
      avatar?: string | null;
      primaryName?: string | null;
      names?: string[] | null;
      primaryEmail?: string | null;
    }[];
  } | null;
}
