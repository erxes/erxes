import { packageFields } from './queries';

const commonFields = `
  $name: String
  $description: String
  $wpId: String
  $level: String
  $projectWpId: String
  $projectId: String
  $price: Float
  $duration: Float
`;

const commonVariables = `
  name: $name 
  description: $description 
  wpId: $wpId
  level: $level
  projectWpId: $projectWpId 
  projectId: $projectId 
  price: $price 
  duration: $duration
`;

const packagesAdd = `
  mutation packagesAdd(${commonFields}) {
    packagesAdd(${commonVariables}) {
      ${packageFields}
    }
  }
`;

const packagesEdit = `
  mutation packagesEdit($_id: String!, ${commonFields}) {
    packagesEdit(_id: $_id, ${commonVariables}) {
      ${packageFields}
    }
  }
`;

const packagesRemove = `
  mutation packagesRemove($_id: String!) {
    packagesRemove(_id: $_id)
  }
`;

export default {
  packagesAdd,
  packagesEdit,
  packagesRemove
};
