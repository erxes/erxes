import { graphqlRequest } from '../db/connection';
import { departmentFactory, userFactory } from '../db/factories';
import { Departments, Users } from '../db/models';

import './setup.ts';

describe('Test departmant mutations', () => {
    let _department;
  let _user;
  let doc;
  let context;

    beforeEach(async () => {
        // Creating test data
        _user = await userFactory({});
        _department = await departmentFactory({})
    
        context = { user: _user };
    
        doc = {
          title: _department.title,
          description: _department.description,
        };
      });
      
      afterEach(async () => {
        // Clearing test data
        await Departments.deleteMany({});
        await Users.deleteMany({});
      });
    
      const commonDeparmentParamsDef = `
  $title: String,
  $description: String,
  $parentId: String
  $userIds: [String]
`;

const commonDeparmentParams = `
  title: $title,
  description: $description
  parentId: $parentId
  userIds: $userIds
`;

const departmentsAdd = `
  mutation departmentsAdd(${commonDeparmentParamsDef}) {
    departmentsAdd(${commonDeparmentParams}) {
      _id
    }
  }
`;

const departmentsEdit = `
  mutation departmentsEdit(_id: String!, ${commonDeparmentParamsDef}) {
    departmentsEdit($_id: _id, ${commonDeparmentParams}) {
      _id
    }
  }
`;
    test('Add department', async () => {
        const tag = await graphqlRequest(departmentsAdd, 'tagsAdd', doc, context);
    
        expect(tag.name).toBe(doc.name);
        expect(tag.type).toBe(doc.type);
        expect(tag.colorCode).toBe(doc.colorCode);
      });
});