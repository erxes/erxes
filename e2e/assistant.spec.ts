import { MODEL_KEY } from './assistantModel';
import { ask, connectFakeModel, openAssistant } from './assistantPanel';
import { expect, expectAccessible, test, unique } from './fixtures';

test.beforeEach(connectFakeModel);

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
  await panel.getByRole('button', { name: 'Send', exact: true }).click();

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

test('a reply links each customer it lists, and the page it opens is sent as context', async ({
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

  const chip = panel.getByRole('table').getByRole('link').first();
  const name = (await chip.textContent())?.trim() ?? '';

  expect(name).not.toBe('');
  await expect(chip).toHaveAttribute('href', /^\/contacts\/customers\/[\w-]+$/);
  await expectAccessible(page);

  await chip.click();
  await expect(page).toHaveURL(/\/contacts\/customers\/[\w-]+$/);

  const context = panel.getByText(`Viewing${name}`);

  await expect(context).toBeVisible();
  await expectAccessible(page);

  await panel.getByRole('button', { name: "Don't send this page" }).click();
  await expect(context).toBeHidden();
});

test('a member mentions a record with @ and sees it linked in the message', async ({
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

  const links = panel.getByRole('link', { name: label });

  await expect(links).toHaveCount(2);
  await expect(links.first()).toHaveAttribute('href', `/contacts/customers/${customer.id}`);
  await expect(panel.getByText('No open deals yet')).toBeVisible();
  await expectAccessible(page);
});

test('a member edits the newest question, sees the note, and asks again', async ({ page }) => {
  const suffix = unique();
  const panel = await openAssistant(page);

  await ask(panel, `Hello there ${suffix}`);
  await expect(panel.getByText('Hello! How can I help?')).toBeVisible();

  await panel.getByText(`Hello there ${suffix}`).hover();
  await panel.getByRole('button', { name: 'Edit', exact: true }).click();

  const edit = panel.getByRole('form', { name: 'Edit your message' });

  await expect(edit).toContainText('Changes the assistant already made in your workspace stay.');
  await expectAccessible(page);

  await edit.getByRole('textbox', { name: 'Message' }).fill(`Say goodbye ${suffix}`);
  await edit.getByRole('button', { name: 'Send' }).click();
  await expect(panel.getByText('Goodbye! Talk soon.')).toBeVisible();
  await expect(panel.getByText(`Hello there ${suffix}`)).toBeHidden();
  await expect(panel.getByText('Hello! How can I help?')).toBeHidden();

  await panel.getByRole('button', { name: 'Ask again' }).click();
  await expect(panel.getByRole('button', { name: 'Ask again' })).toBeVisible();
  await expect(panel.getByText('Goodbye! Talk soon.')).toHaveCount(1);

  await page.reload();
  await expect(panel.getByText(`Say goodbye ${suffix}`)).toBeVisible();
  await expect(panel.getByText('Goodbye! Talk soon.')).toHaveCount(1);
  await expect(panel.getByText(`Hello there ${suffix}`)).toBeHidden();
});
