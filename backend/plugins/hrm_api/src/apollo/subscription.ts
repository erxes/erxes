import { gql } from 'graphql-tag';

export default function subscription() {
  return gql`
    extend type Subscription {
      hrmChanged: JSON
    }
  `;
}
