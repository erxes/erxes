import { gql } from '~/gql';

export const SALES_SOURCE_AUTOMATION_REMOVE = gql(`
  mutation SalesSourceAutomationRemove($automationIds: [String]) {
    automationsRemove(automationIds: $automationIds)
  }
`);
