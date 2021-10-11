import {
  branchFactory,
  departmentFactory,
  structureFactory,
  unitFactory,
  userFactory
} from '../db/factories';
import { Branches, Departments, Structures, Units } from '../db/models';

import './setup.ts';

describe('Test department model', () => {
  let structure;
  let department;
  let unit;
  let branch;

  beforeEach(async () => {
    structure = await structureFactory({});
    branch = await branchFactory({});
    department = await departmentFactory({});
    unit = await unitFactory({});
  });

  afterEach(async () => {
    await Structures.deleteMany({});
    await Departments.deleteMany({});
    await Units.deleteMany({});
    await Branches.deleteMany({});
  });

  test('Get structure ', async () => {
    const response = await Structures.getStructure({ _id: structure._id });

    expect(response).toBeDefined();
  });

  test('Get structure Error: Structure not found', async () => {
    try {
      await Structures.getStructure({ _id: 'fakeId' });
    } catch (e) {
      expect(e.message).toBe('Structure not found');
    }
  });

  test('Create structure ', async () => {
    const response = await Structures.createStructure(
      { title: 'test' },
      await userFactory()
    );

    expect(response).toBeDefined();
  });

  test('Update structure ', async () => {
    const response = await Structures.updateStructure(
      structure._id,
      { title: 'test update' },
      await userFactory()
    );

    expect(response.title).toBe('test update');
  });

  test('Remove structure ', async () => {
    await Structures.removeStructure(structure._id);

    expect(await Structures.find().countDocuments()).toBe(0);
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

  test('Get branch ', async () => {
    const response = await Branches.getBranch({ _id: branch._id });

    expect(response).toBeDefined();
  });

  test('Get branch Error: Branch not found', async () => {
    try {
      await Branches.getBranch({ _id: 'fakeId' });
    } catch (e) {
      expect(e.message).toBe('Branch not found');
    }
  });

  test('Create branch ', async () => {
    const response = await Branches.createBranch(
      { title: 'test' },
      await userFactory()
    );

    expect(response).toBeDefined();
  });

  test('Update branch ', async () => {
    const response = await Branches.updateBranch(
      branch._id,
      { title: 'test update' },
      await userFactory()
    );

    expect(response.title).toBe('test update');
  });

  test('Remove branch ', async () => {
    await Branches.removeBranch(branch._id);

    expect(await Branches.find().countDocuments()).toBe(0);
  });
});
