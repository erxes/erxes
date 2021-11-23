import { exmFactory, userFactory } from '../db/factories';
import { Exms } from '../db/models';

import './setup.ts';

describe('Test exm model', () => {
  let exm;

  beforeEach(async () => {
    // Creating test data
    exm = await exmFactory({});
  });

  afterEach(async () => {
    // Clearing test data
    await Exms.deleteMany({});
  });

  test('Create exm ', async () => {
    const response = await Exms.createExm(
      { name: 'test' },
      await userFactory()
    );

    expect(response).toBeDefined();
  });

  test('Update exm ', async () => {
    const response = await Exms.updateExm(exm._id, { name: 'test update' });

    expect(response.name).toBe('test update');
  });

  test('Remove exm ', async () => {
    await Exms.removeExm(exm._id);

    expect(await Exms.find().countDocuments()).toBe(0);
  });

  describe('Get exm', () => {
    test('When there is Exm, return Exm object', async () => {
      const response = await Exms.getExm(exm._id);

      expect(response).toBeDefined();
    });

    test('When there is no exm, return `Exm not found` error message', async () => {
      try {
        await Exms.getExm('fakeId');
      } catch (e) {
        expect(e.message).toBe('Exm not found');
      }
    });
  });
});
