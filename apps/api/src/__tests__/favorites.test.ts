import { FAVORITES_MAX } from '@erxes/core-contract';
import { describe, expect, it } from 'vite-plus/test';
import { useTestDatabase } from './db';
import { useTwoOrgs } from './support';

describe('favorites', { timeout: 120_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();

  it("keeps each member's starred pages, in their order, for them alone", async () => {
    const owner = t.owner();

    const contacts = await owner.favorites.add({ path: '/contacts?view=v1', label: 'VIP people' });
    const products = await owner.favorites.add({ path: '/products', label: 'Products' });
    const settings = await owner.favorites.add({ path: '/settings/team', label: 'Team' });

    expect(contacts.position).toBe(1);
    expect(settings.position).toBe(3);

    // Starring a page again keeps its place and takes the new label.
    const again = await owner.favorites.add({ path: '/products', label: 'All products' });

    expect(again).toMatchObject({ id: products.id, position: 2, label: 'All products' });

    // The other member and the other organisation see none of them, and can't touch them.
    expect((await t.member().favorites.list()).data).toEqual([]);
    expect((await t.other().favorites.list()).data).toEqual([]);
    await expect(t.member().favorites.remove({ id: contacts.id })).rejects.toMatchObject({
      status: 404,
      code: 'NOT_FOUND',
    });
    await expect(
      t.other().favorites.rename({ id: contacts.id, label: 'Mine now' }),
    ).rejects.toMatchObject({ status: 404 });

    // Ones not named in the new order follow in their old order.
    const reordered = await owner.favorites.reorder({ ids: [settings.id, 'unknownid12345678'] });

    expect(reordered.data.map((row) => [row.id, row.position])).toEqual([
      [settings.id, 1],
      [contacts.id, 2],
      [products.id, 3],
    ]);

    await owner.favorites.rename({ id: contacts.id, label: '  VIPs ' });
    await owner.favorites.remove({ id: products.id });

    expect((await owner.favorites.list()).data.map((row) => row.label)).toEqual(['Team', 'VIPs']);
  });

  it('refuses addresses that are not web paths, and more than the limit', async () => {
    const member = t.member();

    for (const path of ['https://evil.example/x', '//evil.example', '/', 'contacts']) {
      await expect(member.favorites.add({ path, label: 'Bad' })).rejects.toMatchObject({
        status: 400,
      });
    }

    for (const n of Array.from({ length: FAVORITES_MAX }, (_, index) => index)) {
      await member.favorites.add({ path: `/products?page=${n}`, label: `Page ${n}` });
    }

    await expect(
      member.favorites.add({ path: '/contacts', label: 'One too many' }),
    ).rejects.toMatchObject({ status: 409, code: 'FAVORITE_LIMIT' });

    // A starred page can still be renamed by starring it again.
    await expect(
      member.favorites.add({ path: '/products?page=0', label: 'First' }),
    ).resolves.toMatchObject({ label: 'First', position: 1 });
  });
});
