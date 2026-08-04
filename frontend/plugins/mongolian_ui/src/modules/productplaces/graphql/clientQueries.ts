import { gql } from '@apollo/client';

// Existing query (probably)
export const MN_CONFIG = gql`
  query mnConfig($code: String!, $subId: String) {
    mnConfig(code: $code, subId: $subId) {
      _id
      code
      subId
      value
    }
  }
`;

// NEW: query to fetch all configs for a given code
export const MN_CONFIGS = gql`
  query mnConfigs($code: String!) {
    mnConfigs(code: $code) {
      _id
      code
      subId
      value
    }
  }
`;

export const STAGES_QUERY = gql`
  query stages($pipelineId: String!) {
    stages(pipelineId: $pipelineId) {
      _id
      name
    }
  }
`;
