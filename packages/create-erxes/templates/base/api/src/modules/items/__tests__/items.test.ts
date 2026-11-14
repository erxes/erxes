import type { PluginMember } from '@erxes/plugin-sdk';
import { createRouterClient } from '@orpc/server';
import { describe, expect, it } from 'vite-plus/test';
import { PERMISSIONS } from '#/core.ts';
import { router } from '#/router.ts';

/** The typed client the UI uses, served in-process as this member. */
const clientAs = (orgId: string, permissions: string[] = Object.values(PERMISSIONS)) => {
  const member: PluginMember = {
    userId: `user-${orgId}`,
    orgId,
    role: 'member',
    permissions,
    can: (action) => permissions.includes(action),
    tier: 'pro',
    access: 'full',
    canChange: () => true,
  };

  return createRouterClient(router, { context: { member } });
};

describe('items', () => {
  it('creates, lists newest first in pages, updates and deletes', async () => {
    const client = clientAs('org-a');
    const first = await client.items.create({ name: 'First' });
    const second = await client.items.create({ name: 'Second' });

    expect(first).toMatchObject({ name: 'First', description: '', createdBy: 'user-org-a' });
    expect(first).not.toHaveProperty('orgId');

    const page = await client.items.list({ limit: 1 });

    expect(page.items.map((item) => item.id)).toEqual([second.id]);
    expect(page.nextCursor).toBe(second.id);

    const next = await client.items.list({ limit: 1, cursor: second.id });

    expect(next.items.map((item) => item.id)).toEqual([first.id]);
    expect(next.nextCursor).toBeNull();

    await expect(
      client.items.update({ id: first.id, name: 'First', description: 'Changed' }),
    ).resolves.toMatchObject({ name: 'First', description: 'Changed' });
    await expect(client.items.remove({ id: first.id })).resolves.toEqual({ id: first.id });
    await expect(client.items.list({})).resolves.toMatchObject({ items: [{ id: second.id }] });
  });

  it('refuses a name the organisation already uses, ignoring case', async () => {
    const client = clientAs('org-b');
    const taken = { code: 'ITEM_NAME_TAKEN', status: 409, defined: true };

    await client.items.create({ name: 'Tools' });
    const other = await client.items.create({ name: 'Parts' });

    await expect(client.items.create({ name: 'tools' })).rejects.toMatchObject({
      ...taken,
      data: { name: 'tools' },
    });
    await expect(client.items.update({ id: other.id, name: 'TOOLS' })).rejects.toMatchObject({
      ...taken,
      data: { name: 'TOOLS' },
    });
  });

  it('shows and changes only the items of its own organisation', async () => {
    const theirs = await clientAs('org-c').items.create({ name: 'Shared name' });
    const ours = clientAs('org-d');

    await expect(ours.items.list({})).resolves.toMatchObject({ items: [] });
    await expect(ours.items.create({ name: 'Shared name' })).resolves.toMatchObject({
      name: 'Shared name',
    });
    await expect(ours.items.update({ id: theirs.id, name: 'Mine now' })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
    await expect(ours.items.remove({ id: theirs.id })).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('refuses members without the permission', async () => {
    const viewer = clientAs('org-e', [PERMISSIONS.view]);

    await expect(viewer.items.create({ name: 'No' })).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(viewer.items.list({})).resolves.toMatchObject({ items: [] });
  });
});
