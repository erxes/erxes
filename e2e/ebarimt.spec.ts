import { coreClient, expect, expectAccessibleInBothThemes, test, unique } from './fixtures';

test('an owner sets up eBarimt and sees the receipt of a paid invoice', async ({
  page,
  request,
  baseURL,
}) => {
  const api = coreClient(request, baseURL);

  // A rerun starts from no eBarimt.
  await api.ebarimt.removeSettings({});

  await page.goto('/settings/integrations');

  const card = page.getByRole('region', { name: 'eBarimt' });

  await expect(card.getByText('Not set up')).toBeVisible();
  await expectAccessibleInBothThemes(page);

  await card.getByRole('button', { name: 'Set up' }).click();

  const dialog = page.getByRole('dialog', { name: 'Set up eBarimt' });

  // PosAPI isn't called on save; the receipt below fails to reach it, which the invoice shows.
  await dialog.getByLabel('PosAPI address').fill('https://posapi.example.test');
  await dialog.getByLabel('Company name').fill('E2E Shop');
  await dialog.getByLabel('Merchant tax number (TIN)').fill('37900846788');
  await dialog.getByLabel('District code').fill('3505');
  await expectAccessibleInBothThemes(page);
  await dialog.getByRole('button', { name: 'Save' }).click();
  await expect(dialog).toBeHidden();
  await expect(card.getByText('On', { exact: true })).toBeVisible();

  // Turned off, it stays off.
  await card.getByRole('switch', { name: 'Send receipts' }).click();
  await expect(card.getByText('Off', { exact: true })).toBeVisible();
  await page.reload();
  await expect(card.getByText('Off', { exact: true })).toBeVisible();
  await card.getByRole('switch', { name: 'Send receipts' }).click();
  await expect(card.getByText('On', { exact: true })).toBeVisible();

  // Core's own invoices get receipts too.
  const settings = await api.ebarimt.settings({});

  if (!settings) throw new Error('eBarimt was not saved');

  await api.ebarimt.saveSettings({ ...settings, plugins: ['core'] });

  const gateway = await api.payments.addGateway({ name: 'Test', config: { kind: 'test' } });
  const ref = unique();

  const invoice = await api.payments.createInvoice({
    gatewayId: gateway.id,
    amount: 150_000,
    currency: 'MNT',
    description: `Order ${ref}`,
    referenceType: 'order',
    referenceId: ref,
  });

  await api.payments.payTestInvoice({ id: invoice.id });
  await expect
    .poll(async () => (await api.ebarimt.receipts({ invoiceId: invoice.id })).data[0]?.status, {
      timeout: 30_000,
    })
    .toBe('failed');

  await page.goto('/settings/payments');
  await page.getByRole('button', { name: new RegExp(`Order ${ref}`) }).click();

  const details = page.getByRole('dialog', { name: `Order ${ref}` });

  await expect(details.getByText('Failed')).toBeVisible();
  await expect(details.getByRole('button', { name: 'Send again' })).toBeVisible();
  await expectAccessibleInBothThemes(page);
});
