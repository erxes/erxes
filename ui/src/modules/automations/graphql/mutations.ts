import { automationFields } from './queries';

const commonFields = `
  $name: String,
  $status: String,
  $triggers: [TriggerInput],
  $actions: [ActionInput],
`;

const commonVariables = `
  name: $name,
  status: $status,
  triggers: $triggers,
  actions: $actions,
`;

const automationsAdd = `
  mutation automationsAdd(${commonFields}) {
    automationsAdd(${commonVariables}) {
      ${automationFields}
    }
  }
`;

const automationsSaveAsTemplate = `
  mutation automationsSaveAsTemplate(${commonFields}) {
    automationsSaveAsTemplate(${commonVariables}) {
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
  automationsSaveAsTemplate,
  automationsRemove
};
