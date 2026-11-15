import { openAssistant } from './assistantPanel';
import { expect, test } from './fixtures';

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
