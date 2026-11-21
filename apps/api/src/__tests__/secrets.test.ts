import { secrets } from '@erxes/core-db';
import { and, eq } from 'drizzle-orm';
import { describe, expect, it } from 'vite-plus/test';
import { config } from '~/config';
import { deriveKey, encrypt } from '~/lib/crypto';
import { rotatePluginSecret } from '~/modules/plugins/plugins.service';
import { resealSchedule } from '~/modules/secrets/vault';
import { adminDb, useTestDatabase } from './db';
import { useTwoOrgs } from './support';

const stored = (id: string) => adminDb().select().from(secrets).where(eq(secrets.id, id));

const storedOf = (orgId: string, owner: string) =>
  adminDb()
    .select()
    .from(secrets)
    .where(and(eq(secrets.orgId, orgId), eq(secrets.owner, owner)));

const reseal = async () => {
  await resealSchedule.queues[0]?.run();
};

describe('secret vault', { timeout: 120_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();

  const tms = async () => {
    const secret = await rotatePluginSecret('tms');

    const token = async (org?: string) =>
      (
        await t.client().plugins.token({
          grant_type: 'client_credentials',
          client_id: 'tms',
          client_secret: secret,
          org,
        })
      ).access_token;

    await t.client(await token()).plugins.registerManifest({
      title: 'TMS',
      version: '1',
      scopes: ['secrets:write'],
    });

    return t.client(await token(t.ids.org));
  };

  const notFound = { status: 404, code: 'NOT_FOUND' };

  it('seals a plugin’s secret, gives it back to that plugin in that organisation only, and replaces it under the same id', async () => {
    const { id } = await t.hr().secrets.save({ value: 'page-token-1' });

    expect(await t.hr().secrets.read({ id })).toEqual({ value: 'page-token-1' });

    const [row] = await stored(id);

    expect(row).toMatchObject({ owner: 'hr', orgId: t.ids.org });
    expect(JSON.stringify(row)).not.toContain('page-token-1');

    expect(await t.hr().secrets.replace({ id, value: 'page-token-2' })).toEqual({ id });
    expect(await t.hr().secrets.read({ id })).toEqual({ value: 'page-token-2' });
    expect(await storedOf(t.ids.org, 'hr')).toHaveLength(1);

    const elsewhere = t.hr(t.ids.otherOrg);

    await expect(elsewhere.secrets.read({ id })).rejects.toMatchObject(notFound);
    await expect(elsewhere.secrets.replace({ id, value: 'theirs' })).rejects.toMatchObject(
      notFound,
    );
    await expect(elsewhere.secrets.remove({ id })).rejects.toMatchObject(notFound);

    const other = await tms();

    await expect(other.secrets.read({ id })).rejects.toMatchObject(notFound);
    await expect(other.secrets.replace({ id, value: 'theirs' })).rejects.toMatchObject(notFound);
    await expect(other.secrets.remove({ id })).rejects.toMatchObject(notFound);

    const theirs = await other.secrets.save({ value: 'tms-key' });

    await expect(t.hr().secrets.read({ id: theirs.id })).rejects.toMatchObject(notFound);
    expect(await t.hr().secrets.read({ id })).toEqual({ value: 'page-token-2' });

    expect(await t.hr().secrets.remove({ id })).toEqual({ ok: true });
    await expect(t.hr().secrets.read({ id })).rejects.toMatchObject(notFound);
    await expect(t.hr().secrets.remove({ id })).rejects.toMatchObject(notFound);
    expect(await stored(id)).toEqual([]);
    expect(await other.secrets.read({ id: theirs.id })).toEqual({ value: 'tms-key' });
  });

  it('does not open a sealed value moved to another secret or organisation', async () => {
    const first = await t.hr().secrets.save({ value: 'first' });
    const second = await t.hr().secrets.save({ value: 'second' });
    const theirs = await t.hr(t.ids.otherOrg).secrets.save({ value: 'theirs' });
    const [source] = await stored(first.id);

    if (!source) throw new Error('the secret was not stored');

    const moved = { sealed: source.sealed, keyId: source.keyId };

    await adminDb().update(secrets).set(moved).where(eq(secrets.id, second.id));
    await adminDb().update(secrets).set(moved).where(eq(secrets.id, theirs.id));

    await expect(t.hr().secrets.read({ id: second.id })).rejects.toMatchObject({ status: 500 });
    await expect(t.hr(t.ids.otherOrg).secrets.read({ id: theirs.id })).rejects.toMatchObject({
      status: 500,
    });
    expect(await t.hr().secrets.read({ id: first.id })).toEqual({ value: 'first' });

    await adminDb().update(secrets).set({ owner: 'tms' }).where(eq(secrets.id, first.id));
    await expect((await tms()).secrets.read({ id: first.id })).rejects.toMatchObject({
      status: 500,
    });
  });

  it('removes a feature’s secret with the row that kept it, and keeps one secret through a change', async () => {
    const hook = await t
      .owner()
      .webhooks.create({ url: 'https://example.com/hook', eventTypes: ['*'] });

    const [sealed] = await storedOf(t.ids.org, 'core');

    expect(sealed).toMatchObject({ owner: 'core' });
    expect(JSON.stringify(sealed)).not.toContain(hook.secret);
    await expect(t.hr().secrets.read({ id: sealed?.id ?? '' })).rejects.toMatchObject(notFound);

    const rotated = await t.owner().webhooks.rotateSecret({ id: hook.webhook.id });

    expect(rotated.secret).not.toBe(hook.secret);
    expect((await storedOf(t.ids.org, 'core')).map((row) => row.id)).toEqual([sealed?.id]);

    await t.owner().webhooks.remove({ id: hook.webhook.id });
    expect(await storedOf(t.ids.org, 'core')).toEqual([]);
  });

  it('opens secrets sealed before the vault and moves them to the current key', async () => {
    const legacyKey = deriveKey(config.auth.jwtSecret, 'erxes-core-secrets-v1');
    const current = await t.hr().secrets.save({ value: 'new-value' });
    const [reference] = await stored(current.id);

    if (!reference) throw new Error('the secret was not stored');

    // Nothing to move yet.
    await reseal();
    expect((await stored(current.id))[0]?.sealed).toBe(reference.sealed);

    const hr = { orgId: t.ids.org, owner: 'hr' };

    // A full batch of secrets whose key is gone comes first; the old ones are behind it.
    const lost = Array.from({ length: 200 }, (_, index) => ({
      ...hr,
      id: `000-lost-${String(index).padStart(3, '0')}`,
      keyId: 'a-key-not-set',
      sealed: reference.sealed,
    }));

    const old = ['old-value-1', 'old-value-2'].map((value, index) => ({
      ...hr,
      id: `zz-legacy-${index + 1}`,
      keyId: 'legacy',
      sealed: encrypt(legacyKey, value, ''),
    }));

    await adminDb()
      .insert(secrets)
      .values([...lost, ...old]);

    expect(await t.hr().secrets.read({ id: 'zz-legacy-1' })).toEqual({ value: 'old-value-1' });
    await expect(t.hr().secrets.read({ id: '000-lost-000' })).rejects.toMatchObject({
      status: 500,
    });

    await reseal();

    const moved = await Promise.all(old.map(async ({ id }) => (await stored(id))[0]));

    expect(moved.map((row) => row?.keyId)).toEqual([reference.keyId, reference.keyId]);
    expect(JSON.stringify(moved)).not.toContain('old-value');
    expect(moved[0]?.sealed).not.toBe(moved[1]?.sealed);
    expect((await stored('000-lost-199'))[0]?.keyId).toBe('a-key-not-set');
    expect((await stored(current.id))[0]?.sealed).toBe(reference.sealed);
    expect(await t.hr().secrets.read({ id: 'zz-legacy-1' })).toEqual({ value: 'old-value-1' });
    expect(await t.hr().secrets.read({ id: 'zz-legacy-2' })).toEqual({ value: 'old-value-2' });
    expect(await t.hr().secrets.read({ id: current.id })).toEqual({ value: 'new-value' });

    // Only the ones it can't open are left: the next run moves nothing and still ends well.
    await reseal();
    expect((await stored('zz-legacy-1'))[0]?.sealed).toBe(moved[0]?.sealed);
  });

  it('is for plugins with secrets:write only, and takes no empty value', async () => {
    await expect(t.owner().secrets.save({ value: 'x' })).rejects.toMatchObject({
      code: 'PLUGIN_ONLY',
    });
    await expect(t.hr().secrets.save({ value: '' })).rejects.toMatchObject({ status: 400 });

    const { id } = await t.hr().secrets.save({ value: 'kept' });

    await t.client(await t.pluginToken()).plugins.registerManifest({
      title: 'HR',
      version: '1',
      scopes: ['customers:read'],
    });

    await expect(t.hr().secrets.read({ id })).rejects.toMatchObject({ code: 'SCOPE_REQUIRED' });
    await expect(t.hr().secrets.save({ value: 'x' })).rejects.toMatchObject({
      code: 'SCOPE_REQUIRED',
    });
  });
});
