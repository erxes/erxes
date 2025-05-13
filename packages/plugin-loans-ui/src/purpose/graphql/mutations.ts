import { contractTypeFields } from './queries';

const commonFields = `
  $code: String,
  $name: String,
  $description: String,
  $parentId: String,
`;

const commonVariables = `
  code: $code,
  name: $name,
  description: $description,
  parentId: $parentId,
`;

const purposeAdd = `
  mutation purposeAdd(${commonFields}) {
    purposeAdd(${commonVariables}) {
      ${contractTypeFields}
    }
  }
`;

const purposeEdit = `
  mutation purposeEdit($_id: String!, ${commonFields}) {
    purposeEdit(_id: $_id, ${commonVariables}) {
      ${contractTypeFields}
    }
  }
`;

const purposesRemove = `
  mutation purposesRemove($purposeIds: [String]) {
    purposesRemove(purposeIds: $purposeIds)
  }
`;

export default {
  purposeAdd,
  purposeEdit,
  purposesRemove,
};
