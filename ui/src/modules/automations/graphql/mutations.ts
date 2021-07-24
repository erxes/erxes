import { automationFields } from './queries';

const commonFields = `
  $name: String,
  $status: String,
  $actions: JSON
  $triggers: JSON
`;

const commonVariables = `
  name: $name,
  status: $status,
  actions: $actions,
  triggers: $triggers
`;

const automationsAdd = `
  mutation automationsAdd(${commonFields}) {
    automationsAdd(${commonVariables}) {
      ${automationFields}
    }
  }
`;

const automationsEdit = `
  mutation automationsEdit($_id: String!, ${commonFields}) {
    automationsEdit(_id: $_id, ${commonVariables}) {
      ${automationFields}
    }
  }
`;

const automationsRemove = `
  mutation automationsRemove($automationIds: [String]) {
    automationsRemove(automationIds: $automationIds)
  }
`;

export default {
  automationsAdd,
  automationsEdit,
  automationsRemove
};
