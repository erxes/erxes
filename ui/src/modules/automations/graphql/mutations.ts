import { automationFields, automationNoteFields } from './queries';

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

const noteFields = `
  $automationId: String,
  $triggerId: String,
  $actionId: String,
  $description: String
`;

const noteVariables = `
  automationId: $automationId,
  triggerId: $triggerId,
  actionId: $actionId,
  description: $description
`;

const automationsAdd = `
  mutation automationsAdd(${commonFields}) {
    automationsAdd(${commonVariables}) {
      ${automationFields}
    }
  }
`;

const automationsSaveAsTemplate = `
  mutation automationsSaveAsTemplate($_id: String!, $name: String!) {
    automationsSaveAsTemplate(_id: $_id, name: $name) {
      ${automationFields}
    }
  }
`;

const automationsCreateFromTemplate = `
  mutation automationsCreateFromTemplate($_id: String) {
    automationsCreateFromTemplate(_id: $_id) {
      _id
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

const automationsAddNote = `
  mutation automationsAddNote(${noteFields}) {
    automationsAddNote(${noteVariables}) {
      ${automationNoteFields}
    }
  }
`;

const automationsEditNote = `
  mutation automationsEditNote($_id: String!, ${noteFields}) {
    automationsEditNote(_id: $_id, ${noteVariables}) {
      ${automationNoteFields}
    }
  }
`;

const automationsRemoveNote = `
  mutation automationsRemoveNote($_id: String!) {
    automationsRemoveNote(_id: $_id) {
      _id
    }
  }
`;

export default {
  automationsAdd,
  automationsEdit,
  automationsSaveAsTemplate,
  automationsCreateFromTemplate,
  automationsRemove,
  automationsAddNote,
  automationsRemoveNote,
  automationsEditNote
};
