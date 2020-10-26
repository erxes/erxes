import { brandFactory, formFactory, integrationFactory, scriptFactory } from '../db/factories';
import { Scripts } from '../db/models';
import './setup.ts';

describe('Script model tests', () => {
  afterEach(async () => {
    // Clearing test data
    await Scripts.deleteMany({});
  });

  test('Get script', async () => {
    try {
      await Scripts.getScript('fakeId');
    } catch (e) {
      expect(e.message).toBe('Script not found');
    }

    const script = await scriptFactory({});

    const response = await Scripts.getScript(script._id);

    expect(response).toBeDefined();
  });

  test('Create script', async () => {
    const doc = { name: 'script' };

    const response = await Scripts.createScript(doc);

    expect(response.name).toBe(doc.name);
  });

  test('Create script (Messenger)', async () => {
    const brand = await brandFactory();
    const messenger = await integrationFactory({ kind: 'messenger', brandId: brand._id });

    const doc = {
      name: 'script',
      messengerId: messenger._id,
    };

    const response = await Scripts.createScript(doc);

    expect(response.name).toBe(doc.name);
    expect(response.messengerId).toBe(doc.messengerId);
  });

  test('Create script when messenger (Error: Brand not found)', async () => {
    const messenger = await integrationFactory({ kind: 'messenger' });

    const doc = {
      name: 'script',
      messengerId: messenger._id,
    };

    try {
      await Scripts.createScript(doc);
    } catch (e) {
      expect(e.message).toBe('Brand not found');
    }
  });

  test('Create script when lead', async () => {
    const brand = await brandFactory();
    const form = await formFactory();

    const lead = await integrationFactory({ kind: 'lead', formId: form._id, brandId: brand._id });

    const doc = {
      name: 'script',
      leadIds: [lead._id],
    };

    const response = await Scripts.createScript(doc);

    expect(response.name).toBe(doc.name);
    expect(response.leadIds).toContain(lead._id);
  });

  test('Create script when lead (Error: Brand not found)', async () => {
    const form = await formFactory();

    const lead = await integrationFactory({ kind: 'lead', formId: form._id });

    const doc = {
      name: 'script',
      leadIds: [lead._id],
    };

    try {
      await Scripts.createScript(doc);
    } catch (e) {
      expect(e.message).toBe('Brand not found');
    }
  });

  test('Create script when lead (Error: Form not found)', async () => {
    const brand = await brandFactory();

    const lead = await integrationFactory({ kind: 'lead', brandId: brand._id });

    const doc = {
      name: 'script',
      leadIds: [lead._id],
    };

    try {
      await Scripts.createScript(doc);
    } catch (e) {
      expect(e.message).toBe('Form not found');
    }
  });

  test('Update script', async () => {
    const doc = { name: 'script' };

    const script = await scriptFactory({});

    const response = await Scripts.updateScript(script._id, doc);

    expect(response.name).toBe(doc.name);
  });

  test('Remove script', async () => {
    const script = await scriptFactory({});

    await Scripts.removeScript(script._id);

    expect(await Scripts.findOne({ _id: script._id })).toBeDefined();
  });

  test('Remove script (Error: Script not found)', async () => {
    try {
      await Scripts.removeScript('fakeId');
    } catch (e) {
      expect(e.message).toBe('Script not found with id fakeId');
    }
  });
});
