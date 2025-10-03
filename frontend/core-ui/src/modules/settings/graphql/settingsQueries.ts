import { gql } from '@apollo/client';

const queryConfigsByCodes = gql`
  query ConfigsByCode($codes: [String]) {
    configsByCode(codes: $codes) {
      _id
      code
      value
    }
  }
`;

export const SettingsQueries = {
  queryConfigsByCodes,
};
