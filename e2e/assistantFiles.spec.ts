import type { Locator, Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { ask, connectFakeModel, openAssistant } from './assistantPanel';
import { expect, expectAccessible, test, unique } from './fixtures';

test.beforeEach(connectFakeModel);

const startsWithZip = async (file: { path: () => Promise<string> }) =>
  readFileSync(await file.path())
    .subarray(0, 2)
    .toString();

const download = async (page: Page, card: Locator, item: string) => {
  await card.getByRole('button', { name: 'Download' }).click();

  const [file] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('menuitem', { name: item }).click(),
  ]);

  return file;
};

test('a member attaches a file, the reply reads it, and its card stays after a reload', async ({
  page,
}) => {
  const name = `orders-${unique()}.csv`;
  const panel = await openAssistant(page);

  await panel.locator('input[type="file"]').setInputFiles({
    name,
    mimeType: 'text/csv',
    buffer: Buffer.from('City,Orders\nDarkhan,41\nErdenet,17\n'),
  });

  const tray = panel.getByRole('list', { name: 'To send' });

  await expect(tray.getByText('CSV · 34 B')).toBeVisible();
  await expectAccessible(page);

  await ask(panel, 'What is in the file I attached?');
  await expect(panel.getByText(/Its first line is: City,Orders\./)).toBeVisible();

  const card = panel.getByRole('link', { name: new RegExp(name) });

  await expect(card).toHaveAttribute('href', /^\/core\/v1\/files\/[\w-]+\/download$/);
  await expect(tray).toBeHidden();
  await expectAccessible(page);

  await page.reload();
  await expect(panel.getByRole('link', { name: new RegExp(name) })).toBeVisible();
  await expect(panel.getByText(/Its first line is: City,Orders\./)).toBeVisible();
});

test('a member selects part of the page and the reply knows what and where it is', async ({
  page,
  api,
}) => {
  const lastName = `Selected-${unique()}`;
  const customer = await api.customers.create({ firstName: 'Saraa', lastName });
  const panel = await openAssistant(page, `/contacts/customers/${customer.id}`);

  await panel.getByRole('button', { name: 'Select part of the page' }).click();
  await expect(
    panel.getByText('Click a part of the page to select it. Esc cancels.'),
  ).toBeVisible();

  await page.locator('main').getByText(`Saraa ${lastName}`).first().click();

  const tray = panel.getByRole('list', { name: 'To send' });

  await expect(tray.getByText('Page selection')).toBeVisible();
  await expect(tray.locator('img')).toBeVisible();
  await expectAccessible(page);

  await ask(panel, 'Explain what I selected');
  await expect(panel.getByText(`/contacts/customers/${customer.id}`)).toBeVisible();
  await expect(panel.getByRole('link', { name: /Page selection/ })).toHaveAttribute(
    'href',
    /^\/core\/v1\/files\/[\w-]+\/download$/,
  );
  await expectAccessible(page);
});

test('a member gets a report, a table and a document as cards and downloads them', async ({
  page,
}) => {
  const panel = await openAssistant(page);

  await ask(panel, 'Make a sales report for September');

  const report = panel.getByRole('region', { name: 'September sales report' });

  await expect(panel.getByText('September sales report is ready.')).toBeVisible();
  await expect(report.locator('iframe').contentFrame().getByText('₮118.9M')).toBeVisible();
  await expectAccessible(page);

  await report.getByRole('button', { name: 'Open' }).click();

  const full = page.getByRole('dialog', { name: 'September sales report' });
  const finding = full.locator('iframe').contentFrame().getByText('Darkhan grew fastest at +14%.');

  await expect(finding).toBeVisible();
  await expectAccessible(page);
  await page.keyboard.press('Escape');
  await expect(full).toBeHidden();

  const html = await download(page, report, 'HTML file');

  expect(html.suggestedFilename()).toBe('September-sales-report.html');

  await ask(panel, 'Export orders by city as a spreadsheet');

  const table = panel.getByRole('region', { name: 'Orders by city' });

  await expect(table.getByText('Table · 3 rows')).toBeVisible();
  await expect(table.getByRole('cell', { name: 'Darkhan' })).toBeVisible();
  await expectAccessible(page);

  const workbook = await download(page, table, 'Excel workbook (.xlsx)');

  expect(workbook.suggestedFilename()).toBe('Orders-by-city.xlsx');
  expect(await startsWithZip(workbook)).toBe('PK');

  const csv = await download(page, table, 'CSV file');

  expect(readFileSync(await csv.path(), 'utf8')).toContain('Darkhan,73,21100000');

  await ask(panel, 'Write the meeting notes for the weekly sales meeting');

  const notes = panel.getByRole('region', { name: 'Weekly sales meeting' });

  await expect(notes.getByRole('heading', { name: 'Decisions' })).toBeVisible();
  await expectAccessible(page);

  const word = await download(page, notes, 'Word document (.docx)');

  expect(word.suggestedFilename()).toBe('Weekly-sales-meeting.docx');
  expect(await startsWithZip(word)).toBe('PK');
});
