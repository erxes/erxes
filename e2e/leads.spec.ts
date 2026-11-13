import { expect, expectAccessible, test, unique } from './fixtures';

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

  // A real pointer drag: dnd-kit starts after 6px of movement.
  await card.hover();
  await page.mouse.down();
  const box = await target.boundingBox();

  if (!box) throw new Error(`the ${to.name} column is not on screen`);

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 12 });
  await page.mouse.up();

  await expect(target.getByRole('button', { name: new RegExp(name) })).toBeVisible();
  await expect.poll(async () => (await api.customers.get({ id: lead.id })).leadStageId).toBe(to.id);

  await page.reload();
  await expect(target.getByRole('button', { name: new RegExp(name) })).toBeVisible();
});
