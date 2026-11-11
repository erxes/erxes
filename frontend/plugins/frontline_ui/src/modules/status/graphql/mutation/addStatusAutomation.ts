import { gql } from '~/gql';

export const FRONTLINE_STATUS_AUTOMATION_ADD = gql(`
  mutation FrontlineStatusAutomationAdd(
    $name: String
    $status: String
    $triggers: [TriggerInput]
    $actions: [ActionInput]
  ) {
    automationsAdd(
      name: $name
      status: $status
      triggers: $triggers
      actions: $actions
    ) {
      _id
    }
  }
`);
