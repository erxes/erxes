import { gql } from '@apollo/client';

export const AUTOMATION_BUILT_IN_TEMPLATE_MATERIALIZE = gql`
  query automationBuiltInTemplateMaterialize(
    $pluginName: String!
    $templateId: String!
    $answers: JSON
    $usedIds: [String]
  ) {
    automationBuiltInTemplateMaterialize(
      pluginName: $pluginName
      templateId: $templateId
      answers: $answers
      usedIds: $usedIds
    )
  }
`;
