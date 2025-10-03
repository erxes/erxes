import { gql } from '@apollo/client';

export const UNITS_ADD = gql`
  mutation UnitsAdd($title: String, $code: String) {
    unitsAdd(title: $title, code: $code) {
      _id
    }
  }
`;
