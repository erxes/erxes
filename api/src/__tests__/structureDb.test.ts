import { departmentFactory, unitFactory, userFactory } from '../db/factories';
import { Departments, Units } from '../db/models';

import './setup.ts';

describe('Test department model', () => {
  let department;
  let unit;

  beforeEach(async () => {
    department = await departmentFactory({});
    unit = await unitFactory({});
  });

  afterEach(async () => {
    await Departments.deleteMany({});

    await Units.deleteMany({});
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

  test('Get unit ', async () => {
    const response = await Units.getUnit({ _id: unit._id });

    expect(response).toBeDefined();
  });

  test('Get unit Error: Unit not found', async () => {
    try {
      await Units.getUnit({ _id: 'fakeId' });
    } catch (e) {
      expect(e.message).toBe('Unit not found');
    }
  });

  test('Create unit ', async () => {
    const response = await Units.createUnit(
      { title: 'test' },
      await userFactory()
    );

    expect(response).toBeDefined();
  });

  test('Update unit ', async () => {
    const response = await Units.updateUnit(
      unit._id,
      { title: 'test update' },
      await userFactory()
    );

    expect(response.title).toBe('test update');
  });

  test('Remove unit ', async () => {
    await Units.removeUnit(unit._id);

    expect(await Units.find().countDocuments()).toBe(0);
  });
});
