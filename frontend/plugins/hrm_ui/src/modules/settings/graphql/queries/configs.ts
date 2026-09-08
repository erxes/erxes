import { gql } from '@apollo/client';

export const HRM_CONFIGS_BY_CODE = gql`
  query hrmConfigsByCode($codes: [String!]!) {
    hrmConfigsByCode(codes: $codes)
  }
`;
