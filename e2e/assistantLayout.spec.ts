import { ask, connectFakeModel, openAssistant } from './assistantPanel';
import { expect, test, unique } from './fixtures';

test.beforeEach(connectFakeModel);

test('a long conversation keeps its newest reply in view, and two open conversations fit the header', async ({
  page,
}) => {
  const panel = await openAssistant(page);

  await expect(panel.getByRole('textbox', { name: 'Message' })).toBeFocused();

  await ask(panel, 'Make a sales report');
  await expect(panel.getByText('September sales report is ready.')).toBeInViewport();
  await ask(panel, 'Export orders by city');
  await expect(panel.getByText('Orders by city is ready.')).toBeInViewport();
  await ask(panel, 'Write the meeting notes');
  await expect(panel.getByText('Weekly sales meeting is ready.')).toBeInViewport();

  const name = `Zoe ${unique()}`;

  await ask(panel, `Add a customer named ${name}`);
  await expect(panel.getByText(`Added ${name} as a customer.`)).toBeInViewport();

  await panel.getByRole('button', { name: 'New chat' }).click();
  await expect(panel.getByRole('textbox', { name: 'Message' })).toBeFocused();

  await ask(panel, 'Draft a welcome message');
  await expect(panel.getByRole('tab', { selected: true })).toHaveText(
    'Welcome message for new customers',
  );
  await expect(panel.getByRole('tab')).toHaveCount(2);

  for (const tab of await panel.getByRole('tab').all()) {
    await expect(tab).toBeInViewport({ ratio: 1 });
  }
});

test('dragging the panel edge resizes it as the pointer moves, and it still fits a phone', async ({
  page,
}) => {
  const panel = await openAssistant(page);
  const handle = panel.getByRole('separator', { name: 'Resize side panel' });
  const width = async () => Math.round((await panel.boundingBox())?.width ?? 0);
  const edge = await handle.boundingBox();

  expect(edge).not.toBeNull();

  const x = (edge?.x ?? 0) + (edge?.width ?? 0) / 2;
  const y = (edge?.y ?? 0) + (edge?.height ?? 0) / 2;
  const start = await width();

  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x - 60, y, { steps: 6 });
  await expect.poll(width).toBe(start + 60);

  await page.mouse.move(x - 120, y, { steps: 6 });
  await expect.poll(width).toBe(start + 120);

  await page.mouse.up();
  await expect.poll(width).toBe(start + 120);

  await handle.press('ArrowLeft');
  await expect.poll(width).toBe(start + 136);

  await page.setViewportSize({ width: 390, height: 800 });
  await expect.poll(width).toBe(390);
});
