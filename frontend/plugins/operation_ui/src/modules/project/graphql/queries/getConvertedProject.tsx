import gql from 'graphql-tag';

export const GET_CONVERTED_PROJECT = gql`
  query getConvertedProject($convertedFromId: String) {
    getConvertedProject(convertedFromId: $convertedFromId) {
      _id
    }
  }
`;
