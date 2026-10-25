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
