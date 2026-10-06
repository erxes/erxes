import { gql } from '@apollo/client';

export const MONGOLIAN_PRODUCT_REMAINDER_CONFIG = gql`
  query mongolianProductRemainderConfig($pipelineId: String!) {
    mnConfig(code: "remainderConfig", subId: $pipelineId) {
      _id
      value
    }
  }
`;

export const MONGOLIAN_ERKHET_PRODUCT_REMAINDERS = gql`
  query mongolianErkhetProductRemainders(
    $productIds: [String]
    $pipelineId: String
  ) {
    erkhetRemainders(productIds: $productIds, pipelineId: $pipelineId) {
      _id
      remainder
      remainders
    }
  }
`;
