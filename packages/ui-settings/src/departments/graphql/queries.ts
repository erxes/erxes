import * as teamQueries from '@erxes/ui/src/team/graphql';

const detailFields = teamQueries.detailFields;

const departmentField = `
  _id
  title
  description
  parentId
  code
  supervisorId
  userIds
  users {
    _id
    details {
      ${detailFields}
    }
  }
`;

const departments = `
query departments {
  departments {
    ${departmentField}
  }
}
`;

export default {
  departments
};
