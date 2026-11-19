import { MODEL_KEY } from './assistantModel';
import { ask, connectFakeModel, openAssistant } from './assistantPanel';
import { expect, expectAccessible, test, unique } from './fixtures';

test.beforeEach(connectFakeModel);

test('a member saves a key, asks for a change and sees the result', async ({ page, api }) => {
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
  await panel.getByRole('button', { name: 'Send', exact: true }).click();
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
  await expect(panel.getByRole('tab', { selected: true })).toHaveText('Greeting');

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

  await history.getByRole('combobox').fill(suffix);
  await history.getByRole('option', { name: new RegExp(title) }).click();
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

test('a reply links each customer it lists, and a link shows the customer in place of the chat', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Assistant', exact: true }).click();

  const panel = page.getByRole('complementary', { name: 'Assistant' });

  await expect(panel.getByText('Viewing')).toBeVisible();
  await panel
    .getByRole('textbox', { name: 'Message' })
    .fill('Who are our top customers by won deal value?');
  await panel.getByRole('textbox', { name: 'Message' }).press('Enter');
  await expect(panel.getByText('leads with')).toBeVisible();
  await expect(panel.getByRole('tab', { selected: true })).toHaveText('Top customers this quarter');

  const chip = panel.getByRole('table').getByRole('button').first();
  const name = (await chip.getAttribute('title')) ?? '';

  expect(name).not.toBe('');
  await expectAccessible(page);

  await chip.click();
  await expect(panel.getByRole('tab', { name: 'Detail' })).toBeVisible();
  await expect(panel.getByRole('textbox', { name: 'Message' })).toBeHidden();
  await expect(page).not.toHaveURL(/panel=/);
  await expectAccessible(page);

  await panel.getByRole('button', { name: 'Back' }).click();
  await expect(panel.getByRole('textbox', { name: 'Message' })).toBeVisible();
  await expect(panel.getByText('leads with')).toBeVisible();
});

test('a member mentions a record with @, opens it from the chat, and sends the open record as context', async ({
  page,
  api,
}) => {
  const suffix = unique();
  const customer = await api.customers.create({ firstName: 'Mira', lastName: `Ochir-${suffix}` });
  const label = `Mira Ochir-${suffix}`;

  await page.goto('/');
  await page.getByRole('button', { name: 'Assistant', exact: true }).click();

  const panel = page.getByRole('complementary', { name: 'Assistant' });
  const message = panel.getByRole('textbox', { name: 'Message' });

  await message.pressSequentially(`Tell me about @Ochir-${suffix}`);

  const options = panel.getByRole('listbox', { name: 'Mention a record' });

  await expect(options.getByRole('option', { name: new RegExp(label) })).toBeVisible();
  await expectAccessible(page);

  await message.press('Enter');
  await expect(message).toHaveValue(`Tell me about @${label} `);
  await message.press('Enter');

  const chips = panel.getByRole('button', { name: new RegExp(label) });

  await expect(chips).toHaveCount(2);
  await expect(panel.getByText('No open deals yet')).toBeVisible();
  await expectAccessible(page);

  await chips.first().click();
  await expect(panel.getByRole('tab', { name: 'Detail' })).toBeVisible();
  await expect(panel.getByRole('button', { name: label, exact: true })).toBeVisible();
  await panel.getByRole('button', { name: 'Back' }).click();
  await expect(chips).toHaveCount(2);

  await page.goto(`/contacts/customers?panel=/detail/customer/${customer.id}`);

  const context = panel.getByText(`Viewing${label}`);

  await expect(context).toBeVisible();
  await panel.getByRole('button', { name: "Don't send this page" }).click();
  await expect(context).toBeHidden();
});

test('the assistant reads a skill before it plans an automation, and says so', async ({ page }) => {
  const panel = await openAssistant(page);

  await ask(panel, `Set up an automation that tags website leads ${unique()}`);
  await expect(panel.getByText('Shall I create the draft?')).toBeVisible();

  await panel.getByRole('button', { name: '2 steps' }).click();
  await expect(panel.getByText('Read the author-automation skill')).toBeVisible();
  await panel.getByRole('button', { name: 'Looked up how to do it' }).click();
  await expect(panel.getByText('automation triggers')).toBeVisible();
  await expectAccessible(page);
});
