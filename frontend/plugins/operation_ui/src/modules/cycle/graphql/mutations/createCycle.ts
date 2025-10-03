import { gql } from '@apollo/client';

export const CREATE_CYCLE = gql`
  mutation CreateCycle($input: CycleInput) {
    createCycle(input: $input) {
      _id
    }
  }
`;
