import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { useAutomations } from './automations.fixture';
import { useTestDatabase } from './db';

describe('custom integration inputs', { timeout: 120_000 }, () => {
  useTestDatabase();

  const t = useAutomations();
  let programId = '';

  const run = (input: Record<string, unknown>) =>
    t.owner().integrations.testProgram({ id: programId, input });

  beforeAll(async () => {
    const integration = await t.owner().integrations.create({
      key: 'pier',
      name: 'Pier',
      hosts: ['api.pier.test'],
    });

    const program = await t.owner().integrations.saveProgram({
      integrationId: integration.id,
      kind: 'action',
      key: 'moor',
      label: 'Moor a boat',
      fields: [
        { key: 'name', label: 'Boat name', type: 'text', required: true },
        { key: 'length', label: 'Length', type: 'number' },
      ],
      code: 'return { moored: input.name, length: input.length ?? null };',
    });

    programId = program.id;
  });

  it('stops before the program when a required input is empty', async () => {
    expect(await run({})).toEqual({
      ok: false,
      code: 'INVALID_INPUT',
      message: 'Boat name is required',
    });
    expect(await run({ name: '' })).toMatchObject({ ok: false, message: 'Boat name is required' });
  });

  it('stops before the program when a number input is not a number', async () => {
    expect(await run({ name: 'Ada', length: 'abc' })).toEqual({
      ok: false,
      code: 'INVALID_INPUT',
      message: 'Length must be a number',
    });
  });

  it('runs with a number as text or as a number, and with an optional input left out', async () => {
    expect(await run({ name: 'Ada', length: '12' })).toMatchObject({
      result: { moored: 'Ada', length: '12' },
    });
    expect(await run({ name: 'Ada', length: 12.5 })).toMatchObject({
      result: { moored: 'Ada', length: 12.5 },
    });
    expect(await run({ name: 'Ada' })).toMatchObject({ result: { moored: 'Ada', length: null } });
  });
});
