import { integrationConnections, secrets } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import { config } from '~/config';
import { adminDb, useTestDatabase } from './db';
import { connectProvider, fakeModel } from './fakeModel';
import { useTwoOrgs } from './support';

const KEY = 'fake-kimi-key-for-tests-0001';

describe('assistant AI providers, models and settings', () => {
  useTestDatabase();

  const t = useTwoOrgs();
  let model: Awaited<ReturnType<typeof fakeModel>>;

  beforeAll(async () => {
    model = await fakeModel(KEY);
    Object.assign(config.assistant.endpoints, { kimi: model.url, openai: model.url });
  });

  afterAll(() => model.close());

  it('runs on AI providers connected in Integrations, with their keys sealed, and only admins connect one', async () => {
    await expect(connectProvider(t.member(), KEY)).rejects.toMatchObject({
      status: 403,
      code: 'NOT_ALLOWED',
    });

    const connected = await connectProvider(t.owner(), KEY);

    expect(connected).toMatchObject({ key: 'kimi', status: 'active' });
    expect(JSON.stringify(connected)).not.toContain(KEY);

    const listed = await t.member().assistant.providers({});

    expect(listed.data).toEqual([{ provider: 'kimi' }]);

    const [stored] = await adminDb()
      .select({ sealed: secrets.sealed, settings: integrationConnections.settings })
      .from(integrationConnections)
      .innerJoin(secrets, eq(secrets.id, integrationConnections.secretId))
      .where(eq(integrationConnections.id, connected.id));

    expect(stored?.sealed).toBeTruthy();
    expect(JSON.stringify(stored)).not.toContain(KEY);

    expect((await t.other().assistant.providers({})).data).toEqual([]);
  });

  it('refuses a key the provider does not accept, saying so', async () => {
    const refused = connectProvider(t.owner(), 'not-the-right-key-0000', 'kimi', 'kimi (refused)');

    await expect(refused).rejects.toMatchObject({ status: 400, code: 'GATEWAY_REFUSED' });
    await expect(refused).rejects.toThrow(
      'Kimi Moonshot API refused these credentials: the API key was not accepted (401)',
    );
    expect((await t.owner().assistant.providers({})).data).toEqual([{ provider: 'kimi' }]);
  });

  it('lists a provider once however many connections it has, while one of them is active', async () => {
    const owner = t.owner();
    const [first] = (await owner.integrations.connections({ key: 'kimi' })).data;

    if (!first) throw new Error('kimi is not connected');

    const second = await connectProvider(owner, KEY, 'kimi', 'kimi (second)');

    expect((await owner.assistant.providers({})).data).toEqual([{ provider: 'kimi' }]);

    await owner.integrations.update({ key: 'kimi', id: first.id, status: 'disabled' });
    expect((await owner.assistant.providers({})).data).toEqual([{ provider: 'kimi' }]);

    await owner.integrations.update({ key: 'kimi', id: second.id, status: 'disabled' });
    expect((await owner.assistant.providers({})).data).toEqual([]);

    await owner.integrations.update({ key: 'kimi', id: first.id, status: 'active' });
    await owner.integrations.remove({ key: 'kimi', id: second.id });
  });

  it('keeps a default model only for a connected provider, and only admins change it', async () => {
    const owner = t.owner();

    await expect(
      t.member().assistant.updateSettings({ defaultProvider: 'kimi', defaultModel: 'kimi-k3' }),
    ).rejects.toMatchObject({ status: 403, code: 'NOT_ALLOWED' });

    await expect(
      owner.assistant.updateSettings({ defaultProvider: 'grok', defaultModel: 'grok-4.5' }),
    ).rejects.toMatchObject({ status: 404, code: 'NOT_FOUND' });

    await expect(owner.assistant.updateSettings({ defaultProvider: 'kimi' })).rejects.toMatchObject(
      { status: 400 },
    );

    await connectProvider(owner, KEY, 'openai');
    await owner.assistant.updateSettings({ defaultProvider: 'openai', defaultModel: 'gpt-6-luna' });

    expect(await t.member().assistant.settings({})).toMatchObject({
      defaultProvider: 'openai',
      defaultModel: 'gpt-6-luna',
    });
    expect(await t.other().assistant.settings({})).toMatchObject({
      defaultProvider: null,
      defaultModel: null,
    });

    expect((await owner.assistant.providers({})).data).toEqual([
      { provider: 'kimi' },
      { provider: 'openai' },
    ]);

    await owner.assistant.updateSettings({ defaultProvider: null, defaultModel: null });
    expect(await owner.assistant.settings({})).toMatchObject({ defaultProvider: null });
  });

  it("lists each connected provider's chat models, with a reason instead of the key when it can't", async () => {
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
    expect(failed?.error).toContain('rejected the connected API key');
    expect(failed?.error).not.toContain(KEY);

    model.models(['kimi-k3']);
  });

  it('lets admins turn on code mode for their organisation, and members only read it', async () => {
    const off = { codeMode: false, defaultProvider: null, defaultModel: null };

    expect(await t.member().assistant.settings({})).toEqual(off);

    await expect(t.member().assistant.updateSettings({ codeMode: true })).rejects.toMatchObject({
      status: 403,
      code: 'NOT_ALLOWED',
    });

    await t.owner().assistant.updateSettings({ codeMode: true });

    expect(await t.member().assistant.settings({})).toEqual({ ...off, codeMode: true });
    expect(await t.other().assistant.settings({})).toEqual(off);

    await t.owner().assistant.updateSettings({ codeMode: false });
  });

  it('refuses members whose role does not include the assistant', async () => {
    const member = await t.owner().roles.list({});
    const role = member.data.find((row) => row.key === 'member');

    await t.owner().roles.update({
      key: 'member',
      permissions: (role?.permissions ?? []).filter((action) => action !== 'assistant.chat'),
    });

    await expect(t.member().assistant.providers({})).rejects.toMatchObject({
      status: 403,
      code: 'NOT_ALLOWED',
    });

    await t.owner().roles.update({ key: 'member', permissions: role?.permissions ?? [] });
  });
});
