import { gql } from '@apollo/client';

/**
 * Fetches the board and pipeline a deal belongs to so a record-reference
 * chip can link straight into the right sales board — the deals page
 * needs all three params or it falls back to the default pipeline.
 */
export const AGENTS_DEAL_REFERENCE_TARGET = gql`
  query AgentsDealReferenceTarget($_id: String!) {
    dealDetail(_id: $_id) {
      _id
      boardId
      pipeline {
        _id
        boardId
      }
    }
  }
`;
