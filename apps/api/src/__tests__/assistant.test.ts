import { assistantConnections } from '@erxes/core-db';
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import { config } from '~/config';
import { adminDb, useTestDatabase } from './db';
import { fakeModel } from './fakeModel';
import { useTwoOrgs } from './support';

const KEY = 'fake-kimi-key-for-tests-0001';

describe('assistant connections, models and settings', () => {
  useTestDatabase();

  const t = useTwoOrgs();
  let model: Awaited<ReturnType<typeof fakeModel>>;

  beforeAll(async () => {
    model = await fakeModel(KEY);
    Object.assign(config.assistant.endpoints, { kimi: model.url });
  });

  afterAll(() => model.close());

  it('keeps provider keys sealed and never returns them', async () => {
    const saved = await t.member().assistant.saveConnection({ provider: 'kimi', apiKey: KEY });

    expect(saved).toMatchObject({ provider: 'kimi', hasKey: true, isDefault: true });
    expect(JSON.stringify(saved)).not.toContain(KEY);

    const listed = await t.member().assistant.connections({});

    expect(listed.data).toEqual([expect.objectContaining({ provider: 'kimi', hasKey: true })]);
    expect(JSON.stringify(listed)).not.toContain(KEY);

    const stored = await adminDb().select().from(assistantConnections);

    expect(stored).toHaveLength(1);
    expect(stored[0]?.sealedKey).not.toContain(KEY);

    expect((await t.owner().assistant.connections({})).data).toEqual([]);
  });

  it('moves the default provider and forgets removed keys', async () => {
    const owner = t.owner().assistant;

    await owner.saveConnection({ provider: 'kimi', apiKey: KEY });
    await owner.saveConnection({ provider: 'openai', apiKey: 'fake-openai-key-for-tests' });

    const defaults = async () =>
      Object.fromEntries(
        (await owner.connections({})).data.map((row) => [row.provider, row.isDefault]),
      );

    expect(await defaults()).toEqual({ kimi: true, openai: false });

    await owner.setDefaultProvider({ provider: 'openai' });
    expect(await defaults()).toEqual({ kimi: false, openai: true });

    await owner.removeConnection({ provider: 'openai' });
    expect(await defaults()).toEqual({ kimi: true });

    await expect(owner.removeConnection({ provider: 'grok' })).rejects.toMatchObject({
      status: 404,
      code: 'NOT_FOUND',
    });
    await expect(owner.setDefaultProvider({ provider: 'grok' })).rejects.toMatchObject({
      status: 404,
    });
  });

  it("lists each saved provider's chat models, with a reason instead of the key when it can't", async () => {
    model.models(['kimi-k3', 'kimi-embedding-v1', 'moonshot-v1-8k']);

    const listed = await t.member().assistant.models({});
    const kimi = listed.data.find((row) => row.provider === 'kimi');

    expect(kimi?.error).toBeNull();
    expect(kimi?.models.map((row) => row.id)).toContain('kimi-k3');
    expect(kimi?.models.map((row) => row.id)).not.toContain('kimi-embedding-v1');

    model.models([], 401);

    const failed = (await t.member().assistant.models({})).data.find(
      (row) => row.provider === 'kimi',
    );

    expect(failed?.models).toEqual([]);
    expect(failed?.error).toContain('rejected the saved API key');
    expect(failed?.error).not.toContain(KEY);

    model.models(['kimi-k3']);
  });

  it('checks a model with one small request through the saved key', async () => {
    expect(
      await t.member().assistant.verifyModel({ provider: 'kimi', model: 'kimi-k3' }),
    ).toMatchObject({ ok: true, error: null });
    expect(
      await t.member().assistant.verifyModel({ provider: 'kimi', model: 'kimi-embedding-v1' }),
    ).toMatchObject({ ok: false });
    await expect(
      t.other().assistant.verifyModel({ provider: 'kimi', model: 'kimi-k3' }),
    ).rejects.toMatchObject({ status: 404 });
  });

  it('lets admins choose when the assistant asks, and members only read it', async () => {
    expect(await t.member().assistant.settings({})).toEqual({
      approvalMode: 'writes',
      codeMode: false,
    });

    await expect(
      t.member().assistant.updateSettings({ approvalMode: 'destructive' }),
    ).rejects.toMatchObject({ status: 403, code: 'NOT_ALLOWED' });

    await t.owner().assistant.updateSettings({ approvalMode: 'destructive' });

    expect(await t.member().assistant.settings({})).toEqual({
      approvalMode: 'destructive',
      codeMode: false,
    });
    expect(await t.other().assistant.settings({})).toEqual({
      approvalMode: 'writes',
      codeMode: false,
    });

    await t.owner().assistant.updateSettings({ approvalMode: 'writes' });
  });

  it('refuses members whose role does not include the assistant', async () => {
    const member = await t.owner().roles.list({});
    const role = member.data.find((row) => row.key === 'member');

    await t.owner().roles.update({
      key: 'member',
      permissions: (role?.permissions ?? []).filter((action) => action !== 'assistant.chat'),
    });

    await expect(t.member().assistant.connections({})).rejects.toMatchObject({
      status: 403,
      code: 'NOT_ALLOWED',
    });

    await t.owner().roles.update({ key: 'member', permissions: role?.permissions ?? [] });
  });
});
