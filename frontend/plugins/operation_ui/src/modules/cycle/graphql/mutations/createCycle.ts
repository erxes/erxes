import { gql } from '~/gql';

export const CREATE_CYCLE = gql(`
  mutation CreateCycle($input: CycleInput!) {
    createCycle(input: $input) {
      _id
    }
  }
`);
