import { departmentFactory, userFactory } from '../db/factories';
import { Departments } from '../db/models';

import './setup.ts';

describe('Test department model', () => {
  let department;

  beforeEach(async () => {
    department = await departmentFactory({});
  });

  afterEach(async () => {
    await Departments.deleteMany({});
  });

  test('Get department ', async () => {
    const response = await Departments.getDepartment({ _id: department._id });

    expect(response).toBeDefined();
  });

  test('Get department Error: Department not found', async () => {
    try {
      await Departments.getDepartment({ _id: 'fakeId' });
    } catch (e) {
      expect(e.message).toBe('Department not found');
    }
  });

  test('Create department ', async () => {
    const response = await Departments.createDepartment(
      { title: 'test' },
      await userFactory()
    );

    expect(response).toBeDefined();
  });

  test('Update department ', async () => {
    const response = await Departments.updateDepartment(
      department._id,
      { title: 'test update' },
      await userFactory()
    );

    expect(response.title).toBe('test update');
  });

  test('Remove department ', async () => {
    await Departments.removeDepartment(department._id);

    expect(await Departments.find().countDocuments()).toBe(0);
  });
});
