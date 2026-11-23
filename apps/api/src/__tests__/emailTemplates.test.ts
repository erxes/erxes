import { afterEach, describe, expect, it } from 'vite-plus/test';
import { config } from '~/config';
import { say } from './broadcasts.fixture';
import { useTestDatabase } from './db';
import { useTwoOrgs } from './support';

/** Messages kept to start emails from (self-hosted). */
describe('email templates', () => {
  useTestDatabase();

  const t = useTwoOrgs();

  afterEach(() => {
    config.saas.enabled = false;
  });

  it('keeps messages under one name each, for the organisation only', async () => {
    const owner = t.owner();

    const created = await owner.emailTemplates.create({
      name: 'Newsletter',
      content: say('Hello'),
    });

    expect(created).toMatchObject({ name: 'Newsletter', content: say('Hello') });
    await expect(
      owner.emailTemplates.create({ name: 'newsletter', content: say('Again') }),
    ).rejects.toMatchObject({ status: 409, code: 'TAKEN' });
    await expect(
      owner.emailTemplates.create({ name: 'Raw', content: { type: 'paragraph' } }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_INPUT' });

    const list = await owner.emailTemplates.list({ search: 'news' });

    expect(list.data).toEqual([expect.objectContaining({ id: created.id, name: 'Newsletter' })]);
    expect(list.data[0]).not.toHaveProperty('content');

    const changed = await owner.emailTemplates.update({
      id: created.id,
      name: 'Monthly',
      content: say('Changed'),
    });

    expect(changed).toMatchObject({ name: 'Monthly', content: say('Changed') });
    expect(await owner.emailTemplates.get({ id: created.id })).toMatchObject({ name: 'Monthly' });

    await expect(t.other().emailTemplates.get({ id: created.id })).rejects.toMatchObject({
      status: 404,
    });
    expect((await t.other().emailTemplates.list({})).data).toEqual([]);
    await expect(
      t.member().emailTemplates.create({ name: 'Mine', content: say('Hi') }),
    ).rejects.toMatchObject({ status: 403, code: 'NOT_ALLOWED' });

    expect(await owner.emailTemplates.remove({ id: created.id })).toEqual({ ok: true });
    await expect(owner.emailTemplates.get({ id: created.id })).rejects.toMatchObject({
      status: 404,
    });
  });

  it('come with self-hosted erxes only', async () => {
    config.saas.enabled = true;

    await expect(t.owner().emailTemplates.list({})).rejects.toMatchObject({
      status: 402,
      code: 'NOT_IN_PLAN',
    });
    await expect(
      t.owner().emailTemplates.create({ name: 'SaaS', content: say('Hi') }),
    ).rejects.toMatchObject({ status: 402, code: 'NOT_IN_PLAN' });
  });
});
