import { MODEL_KEY } from './assistantModel';
import { ask, connectFakeModel, openAssistant } from './assistantPanel';
import { expect, expectAccessible, test, unique } from './fixtures';

test.beforeEach(connectFakeModel);

test('an admin connects an AI provider in Integrations, asks for a change and sees the result', async ({
  page,
  api,
}) => {
  const suffix = unique();
  const name = `Ada ${suffix}`;
  const connection = `Kimi ${suffix}`;

  await page.goto('/settings/integrations?tab=browse&category=ai');
  await page.getByRole('link', { name: /Kimi Moonshot API/ }).click();
  await page.getByRole('button', { name: 'Add another', exact: true }).click();
  await page.getByLabel('Name').fill(connection);
  await page.getByLabel('API key').fill(MODEL_KEY);
  await page.getByRole('button', { name: 'Connect Kimi Moonshot API' }).click();
  await expect(page.getByText(`${connection} is connected`)).toBeVisible();
  await expectAccessible(page);

  await page.getByRole('button', { name: 'Assistant', exact: true }).click();

  const panel = page.getByRole('complementary', { name: 'Assistant' });

  await expect(panel.getByRole('heading', { name: 'How can I help?' })).toBeVisible();
  await expect(
    panel.getByRole('button', { name: /^Model: Kimi Moonshot API · .*k3/i }),
  ).toBeVisible();
  await expectAccessible(page);

  await panel.getByRole('textbox', { name: 'Message' }).fill(`Add a customer named ${name}`);
  await panel.getByRole('button', { name: 'Send', exact: true }).click();
  await expect(panel.getByText(`Added ${name} as a customer.`)).toBeVisible();
  await expect(panel.getByRole('button', { name: '1 step' })).toBeVisible();
  await expectAccessible(page);

  await expect.poll(async () => (await api.customers.list({ search: name })).data.length).toBe(1);

  const added = (await api.integrations.connections({ key: 'kimi' })).data.find(
    (row) => row.name === connection,
  );

  if (added) await api.integrations.remove({ key: 'kimi', id: added.id });
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
  const chats = panel.getByRole('button', { name: 'Open conversations' });

  await expect(chats).toHaveText('Greeting');

  await panel.getByRole('button', { name: 'Conversation actions' }).click();
  await page.getByRole('menuitem', { name: 'Rename' }).click();
  await page.getByRole('dialog').getByRole('textbox', { name: 'Title' }).fill(title);
  await page.getByRole('dialog').getByRole('button', { name: 'Save' }).click();
  await expect(chats).toHaveText(title);

  await chats.click();
  await page.getByRole('button', { name: `Close ${title}` }).click();
  await expect(page.getByRole('button', { name: `Close ${title}` })).toBeHidden();
  await page.keyboard.press('Escape');
  await expect(panel.getByRole('heading', { name: 'How can I help?' })).toBeVisible();

  await panel.getByRole('button', { name: 'Open conversations' }).click();
  await page.getByRole('button', { name: 'Conversations', exact: true }).click();

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
  await expect(panel.getByRole('button', { name: 'Open conversations' })).toHaveText(
    'Top customers this quarter',
  );

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

  const chips = panel
    .getByRole('button', { name: new RegExp(label) })
    .and(page.locator('button:not([aria-haspopup])'));

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

test('a reply draws its figures, and a pressed button is answered and then goes off', async ({
  page,
}) => {
  const panel = await openAssistant(page);

  await ask(panel, 'Show sales this quarter');
  await expect(panel.getByText('₮118.9M')).toBeVisible();
  await expect(panel.getByRole('table')).toContainText('Ulaanbaatar');
  await expect(panel.getByText('Revenue by month')).toBeVisible();
  await expectAccessible(page);

  await panel.getByRole('button', { name: 'Break down by channel' }).click();
  await expect(panel.getByText('Web brought ₮71.2M, stores ₮47.7M.')).toBeVisible();
  await expect(panel.getByRole('button', { name: 'Break down by channel' })).toBeDisabled();
});

test('the assistant asks with a form, and what the member enters reaches it', async ({ page }) => {
  const panel = await openAssistant(page);

  await ask(panel, 'Draft a welcome message');
  await panel.getByRole('radio', { name: 'SMS' }).click();
  await panel
    .getByRole('textbox', { name: 'Anything the message must mention?' })
    .fill('Code WELCOME10');
  await expectAccessible(page);

  await panel.getByRole('button', { name: 'Draft message' }).click();
  await expect(panel.getByText('Thanks. I will draft the welcome message for sms.')).toBeVisible();
  await expect(panel.getByRole('definition').filter({ hasText: 'Code WELCOME10' })).toBeVisible();
});

test('a part the panel cannot draw says so once, after one try to fix it', async ({ page }) => {
  const panel = await openAssistant(page);

  await ask(panel, 'Show a gauge');
  await expect(panel.getByText('This part of the reply could not be shown.')).toHaveCount(1);
  await expect(panel.getByRole('button', { name: 'Send', exact: true })).toBeVisible();
});
