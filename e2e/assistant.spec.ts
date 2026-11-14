import { MODEL_KEY } from './assistantModel';
import { expect, expectAccessible, test, unique } from './fixtures';

test.beforeEach(async ({ api }) => {
  await api.assistant.saveConnection({ provider: 'kimi', apiKey: MODEL_KEY });

  const { data } = await api.assistant.models();

  expect(
    data.find((entry) => entry.provider === 'kimi')?.error ?? null,
    'Start the stack with ASSISTANT_KIMI_URL=http://127.0.0.1:3510/v1 so the API talks to the fake model',
  ).toBeNull();
});

test('a member saves a key, asks for a change, approves it and sees the result', async ({
  page,
  api,
}) => {
  const name = `Ada ${unique()}`;

  await page.goto('/settings/assistant');

  const kimi = page.getByRole('region', { name: 'Kimi', exact: true });

  await kimi.getByLabel('Kimi API key').fill(MODEL_KEY);
  await kimi.getByRole('button', { name: 'Save key' }).click();
  await expect(kimi.getByText('Key saved')).toBeVisible();
  await expectAccessible(page);

  await page.getByRole('button', { name: 'Assistant', exact: true }).click();

  const panel = page.getByRole('complementary', { name: 'Assistant' });

  await expect(panel.getByRole('heading', { name: 'How can I help?' })).toBeVisible();
  await expect(panel.getByRole('button', { name: /^Model: Kimi · .*k3/i })).toBeVisible();
  await expectAccessible(page);

  await panel.getByRole('textbox', { name: 'Message' }).fill(`Add a customer named ${name}`);
  await panel.getByRole('button', { name: 'Send' }).click();

  const approval = panel.getByRole('group', { name: 'Approve this change?' });

  await expect(approval).toBeVisible();
  await expect(panel.getByRole('status')).toHaveText('The assistant needs your approval');
  await expectAccessible(page);

  await approval.getByRole('button', { name: 'Approve' }).click();
  await expect(panel.getByText(`Added ${name} as a customer.`)).toBeVisible();
  await expect(panel.getByRole('button', { name: '1 step' })).toBeVisible();
  await expectAccessible(page);

  await expect.poll(async () => (await api.customers.list({ search: name })).data.length).toBe(1);
});

test('closing a tab keeps the conversation; deleting asks first', async ({ page }) => {
  const suffix = unique();
  const question = `Hello there ${suffix}`;
  const title = `Greeting ${suffix}`;

  await page.goto('/');
  await page.getByRole('button', { name: 'Assistant', exact: true }).click();

  const panel = page.getByRole('complementary', { name: 'Assistant' });

  await panel.getByRole('textbox', { name: 'Message' }).fill(question);
  await panel.getByRole('textbox', { name: 'Message' }).press('Enter');
  await expect(panel.getByText('Hello! How can I help?')).toBeVisible();
  await expect(panel.getByRole('tab', { selected: true })).toHaveText('Test title');

  await panel.getByRole('button', { name: 'Conversation actions' }).click();
  await page.getByRole('menuitem', { name: 'Rename' }).click();
  await page.getByRole('dialog').getByRole('textbox', { name: 'Title' }).fill(title);
  await page.getByRole('dialog').getByRole('button', { name: 'Save' }).click();
  await expect(panel.getByRole('tab', { selected: true })).toHaveText(title);

  await panel.getByRole('tab', { name: title }).press('Delete');
  await expect(panel.getByRole('tab', { name: title })).toBeHidden();
  await expect(panel.getByRole('heading', { name: 'How can I help?' })).toBeVisible();

  await panel.getByRole('button', { name: 'Conversations' }).click();

  const history = page.getByRole('dialog', { name: 'Conversations' });

  await history.getByRole('searchbox', { name: 'Search conversations' }).fill(suffix);
  await history.getByRole('button', { name: title }).click();
  await expect(panel.getByText(question)).toBeVisible();
  await expectAccessible(page);

  await panel.getByRole('button', { name: 'Conversation actions' }).click();
  await page.getByRole('menuitem', { name: 'Delete' }).click();

  const confirm = page.getByRole('alertdialog');

  await expect(confirm).toContainText('Delete this conversation?');
  await confirm.getByRole('button', { name: 'Delete' }).click();
  await expect(panel.getByText(question)).toBeHidden();
  await expect(panel.getByRole('heading', { name: 'How can I help?' })).toBeVisible();
});
