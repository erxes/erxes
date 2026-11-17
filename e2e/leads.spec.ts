import type { Locator, Page, Route } from '@playwright/test';
import { type coreClient, expect, expectAccessible, test, unique } from './fixtures';

const boxOf = async (locator: Locator) => {
  const box = await locator.boundingBox();

  if (!box) throw new Error(`${String(locator)} is not on screen`);

  return { ...box, right: box.x + box.width, middle: box.y + box.height / 2 };
};

const centerOf = async (locator: Locator) => {
  const box = await boxOf(locator);

  return { x: box.x + box.width / 2, y: box.middle };
};

/** Holds the card `grab` px from its left edge and lets go at `x`, `y`: dnd-kit starts after 6px. */
const drag = async (page: Page, card: Locator, grab: number, x: number, y: number) => {
  const start = await boxOf(card);

  await page.mouse.move(start.x + grab, start.middle);
  await page.mouse.down();
  await page.mouse.move(start.x + grab + 12, start.middle, { steps: 3 });
  await page.mouse.move(x, y, { steps: 16 });
  await page.mouse.up();
};

/** Answers a held request the way the API does when a save fails. */
const refuse = (route: Route) =>
  route.fulfill({
    status: 500,
    contentType: 'application/json',
    body: JSON.stringify({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Saving failed',
      defined: false,
    }),
  });

/** The board of the leads matching `search`, so the columns hold this test's leads only. */
const openBoard = async (page: Page, search: string) => {
  await page.goto(`/contacts/leads?searchValue=${search}`);
  await page.getByRole('button', { name: 'Display' }).click();
  await page.getByRole('button', { name: 'Board' }).click();
  await page.keyboard.press('Escape');
};

const openStages = async (api: ReturnType<typeof coreClient>) => {
  const { data: stages } = await api.leads.stages({});
  const [first, second] = stages.filter((stage) => stage.kind !== 'disqualified');

  if (!first || !second) throw new Error('a new organisation has at least two open lead stages');

  return [first, second] as const;
};

test('a member moves a lead to the next stage on the board', async ({ page, api }) => {
  const [from, to] = await openStages(api);
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

test('the column under the pointer takes the card, wherever the card is held', async ({
  page,
  api,
}) => {
  const [from, to] = await openStages(api);
  const tag = unique();

  const lead = await api.customers.create({
    firstName: `Edge ${tag}`,
    state: 'lead',
    leadStageId: from.id,
  });

  const stageOf = async () => (await api.customers.get({ id: lead.id })).leadStageId;
  const card = page.getByRole('button', { name: new RegExp(` ${tag}`) });

  await openBoard(page, tag);
  await expect(
    page
      .getByRole('region', { name: from.name })
      .getByRole('button', { name: new RegExp(` ${tag}`) }),
  ).toBeVisible();

  // Held by its right edge, let go just inside the next, empty column.
  const target = await boxOf(page.getByRole('region', { name: to.name }));
  const held = await boxOf(card);

  await drag(page, card, held.width - 6, target.x + 12, target.middle);
  await expect.poll(stageOf).toBe(to.id);
  await expect(
    page
      .getByRole('region', { name: to.name })
      .getByRole('button', { name: new RegExp(` ${tag}`) }),
  ).toBeVisible();
  await page.waitForFunction(() => document.getAnimations().length === 0);

  // Held by its left edge, let go just inside its old column's right edge.
  const back = await boxOf(page.getByRole('region', { name: from.name }));

  await drag(page, card, 6, back.right - 12, back.middle);
  await expect.poll(stageOf).toBe(from.id);
  await expect(
    page
      .getByRole('region', { name: from.name })
      .getByRole('button', { name: new RegExp(` ${tag}`) }),
  ).toBeVisible();
});

test('the dragged copy glides into the new column, not back to the old one', async ({
  page,
  api,
}) => {
  const [from, to] = await openStages(api);
  const tag = unique();

  await api.customers.create({ firstName: `Glide ${tag}`, state: 'lead', leadStageId: from.id });
  await openBoard(page, tag);

  const card = page.getByRole('button', { name: new RegExp(` ${tag}`) });
  const target = page.getByRole('region', { name: to.name });

  await expect(card).toBeVisible();

  const drop = await centerOf(target);
  const start = await boxOf(card);

  await page.mouse.move(start.x + 20, start.middle);
  await page.mouse.down();
  await page.mouse.move(start.x + 32, start.middle, { steps: 3 });
  await page.mouse.move(drop.x, drop.y, { steps: 16 });

  // Where the copy under the pointer is drawn on each frame after the drop, until it is gone.
  const frames = page.evaluate((text) => {
    const copy = () =>
      [...document.querySelectorAll<HTMLElement>('div[style*="position: fixed"]')].find(
        (node) => node.getBoundingClientRect().width > 100 && node.textContent.includes(text),
      );

    return new Promise<number[]>((resolve) => {
      const lefts: number[] = [];

      const frame = () => {
        const node = copy();

        if (!node && lefts.length > 0) return resolve(lefts);

        if (node) lefts.push(node.getBoundingClientRect().left);

        if (lefts.length < 120) requestAnimationFrame(frame);
        else resolve(lefts);
      };

      frame();
    });
  }, tag);

  await page.mouse.up();

  const lefts = await frames;
  const column = await boxOf(target);

  expect(lefts.length).toBeGreaterThan(1);

  for (const left of lefts) expect(left).toBeGreaterThan(column.x - 24);

  await expect(target.getByRole('button', { name: new RegExp(` ${tag}`) })).toBeVisible();
});

test.describe('on a touch screen', () => {
  test.use({ hasTouch: true });

  test('a held card follows the finger to another column', async ({ page, api }) => {
    const [from, to] = await openStages(api);
    const tag = unique();

    const lead = await api.customers.create({
      firstName: `Touch ${tag}`,
      state: 'lead',
      leadStageId: from.id,
    });

    await openBoard(page, tag);

    const card = page.getByRole('button', { name: new RegExp(` ${tag}`) });

    await expect(card).toBeVisible();

    const start = await centerOf(card);
    const drop = await centerOf(page.getByRole('region', { name: to.name }));
    const cdp = await page.context().newCDPSession(page);

    const touch = (type: 'touchStart' | 'touchMove' | 'touchEnd', x: number, y: number) =>
      cdp.send('Input.dispatchTouchEvent', {
        type,
        touchPoints: type === 'touchEnd' ? [] : [{ x, y }],
      });

    // Held a moment before it moves, as a finger does, then dragged across.
    await touch('touchStart', start.x, start.y);
    await page.waitForTimeout(300);

    for (let step = 1; step <= 16; step++) {
      await touch(
        'touchMove',
        start.x + ((drop.x - start.x) * step) / 16,
        start.y + ((drop.y - start.y) * step) / 16,
      );
    }

    await touch('touchEnd', drop.x, drop.y);

    await expect
      .poll(async () => (await api.customers.get({ id: lead.id })).leadStageId)
      .toBe(to.id);
  });
});

test('the keyboard picks a card up, moves it a column across and drops it', async ({
  page,
  api,
}) => {
  const [from, to] = await openStages(api);
  const tag = unique();

  const lead = await api.customers.create({
    firstName: `Keys ${tag}`,
    state: 'lead',
    leadStageId: from.id,
  });

  await openBoard(page, tag);

  const card = page.getByRole('button', { name: new RegExp(` ${tag}`) });

  await card.focus();
  await page.keyboard.press('Space');
  await expect(page.getByText(`Keys ${tag} is in ${from.name}.`)).toBeAttached();
  // dnd-kit listens for the arrow keys from the next timer tick after the pick-up.
  await page.evaluate(() => new Promise((resolve) => setTimeout(resolve)));
  await page.keyboard.press('ArrowRight');
  await expect(page.getByText(`Keys ${tag} is in ${to.name}.`)).toBeAttached();
  await page.keyboard.press('Space');

  await expect.poll(async () => (await api.customers.get({ id: lead.id })).leadStageId).toBe(to.id);

  // The moved card keeps the focus in its new column, and Enter opens it.
  await expect(
    page
      .getByRole('region', { name: to.name })
      .getByRole('button', { name: new RegExp(` ${tag}`) }),
  ).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('tab', { name: 'Detail' })).toBeVisible();
});

test('a move the server refuses puts the card back and says why', async ({ page, api }) => {
  const [from, to] = await openStages(api);
  const tag = unique();

  const lead = await api.customers.create({
    firstName: `Refused ${tag}`,
    state: 'lead',
    leadStageId: from.id,
  });

  const held: Route[] = [];

  await page.route('**/leads/move', (route) => {
    held.push(route);
  });

  await openBoard(page, tag);

  const card = page.getByRole('button', { name: new RegExp(` ${tag}`) });
  const target = page.getByRole('region', { name: to.name });
  const box = await boxOf(target);

  await drag(page, card, 20, box.x + box.width / 2, box.middle);

  // It lands at once, then goes back when the server refuses.
  await expect(target.getByRole('button', { name: new RegExp(` ${tag}`) })).toBeVisible();
  await expect.poll(() => held.length).toBe(1);
  await Promise.all(held.map(refuse));

  await expect(page.getByText('Could not move the lead')).toBeVisible();
  await expect(
    page
      .getByRole('region', { name: from.name })
      .getByRole('button', { name: new RegExp(` ${tag}`) }),
  ).toBeVisible();
  expect((await api.customers.get({ id: lead.id })).leadStageId).toBe(from.id);
});

test('a card let go over the sidebar stays put while the board is scrolled', async ({
  page,
  api,
}) => {
  const { data: stages } = await api.leads.stages({});
  const last = stages.filter((stage) => stage.kind !== 'disqualified').at(-1);

  if (!last) throw new Error('a new organisation has open lead stages');

  const tag = unique();

  const lead = await api.customers.create({
    firstName: `Stay ${tag}`,
    state: 'lead',
    leadStageId: last.id,
  });

  const moves: string[] = [];

  page.on('request', (request) => {
    if (request.url().includes('/leads/move')) moves.push(request.url());
  });

  await openBoard(page, tag);

  const column = page.getByRole('region', { name: last.name, exact: true });

  await column.scrollIntoViewIfNeeded();
  await expect(column.locator('..')).not.toHaveJSProperty('scrollLeft', 0);

  // The first columns sit scrolled away under the sidebar.
  const sidebar = await boxOf(page.getByRole('link', { name: 'People' }));
  const card = column.getByRole('button', { name: new RegExp(` ${tag}`) });

  const held = await boxOf(card);

  // A quick flick: let go before the board scrolls itself back.
  await page.mouse.move(held.x + 20, held.middle);
  await page.mouse.down();
  await page.mouse.move(held.x + 32, held.middle, { steps: 3 });
  await page.mouse.move(sidebar.x + sidebar.width / 2, held.middle);
  await page.mouse.up();
  await page.waitForFunction(() => document.getAnimations().length === 0);

  await expect(column.getByRole('button', { name: new RegExp(` ${tag}`) })).toBeVisible();
  expect(moves).toEqual([]);
  expect((await api.customers.get({ id: lead.id })).leadStageId).toBe(last.id);
});
