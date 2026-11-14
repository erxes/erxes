import type { Locator } from '@playwright/test';
import { expect, expectAccessible, test, unique } from './fixtures';

const centerOf = async (locator: Locator) => {
  const box = await locator.boundingBox();

  if (!box) throw new Error(`${String(locator)} is not on screen`);

  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
};

test('a member moves a lead to the next stage on the board', async ({ page, api }) => {
  const { data: stages } = await api.leads.stages({});
  const [from, to] = stages.filter((stage) => stage.kind !== 'disqualified');

  if (!from || !to) throw new Error('a new organisation has at least two open lead stages');

  const name = `Grace ${unique()}`;
  const lead = await api.customers.create({ firstName: name, state: 'lead', leadStageId: from.id });

  await page.goto('/contacts/leads');
  await page.getByRole('button', { name: 'Display' }).click();
  await page.getByRole('button', { name: 'Board' }).click();
  await page.keyboard.press('Escape');

  const card = page
    .getByRole('region', { name: from.name })
    .getByRole('button', { name: new RegExp(name) });

  const target = page.getByRole('region', { name: to.name });

  await expect(card).toBeVisible();
  await expectAccessible(page);

  // A real pointer drag: dnd-kit starts after 6px of movement. The board stays put on the
  // way (patches/@dnd-kit__core), so the column is where it was when the drag began.
  await card.hover();
  const start = await centerOf(card);
  const drop = await centerOf(target);
  await page.mouse.down();
  await page.mouse.move(start.x + 12, start.y, { steps: 3 });
  await page.mouse.move(drop.x, drop.y, { steps: 12 });
  // The drop point is nowhere near the board's edges, so nothing scrolled it.
  await expect(target.locator('..')).toHaveJSProperty('scrollLeft', 0);
  await page.mouse.up();

  await expect(target.getByRole('button', { name: new RegExp(name) })).toBeVisible();
  await expect.poll(async () => (await api.customers.get({ id: lead.id })).leadStageId).toBe(to.id);

  await page.reload();
  await expect(target.getByRole('button', { name: new RegExp(name) })).toBeVisible();
});
