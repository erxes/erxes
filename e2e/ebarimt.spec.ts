import { coreClient, expect, expectAccessibleInBothThemes, test, unique } from './fixtures';

test('an owner finds eBarimt in the catalog, sets it up, and sees a receipt that failed', async ({
  page,
  request,
  baseURL,
}) => {
  const api = coreClient(request, baseURL);

  // A rerun starts from no eBarimt.
  await api.ebarimt.removeSettings({});

  await page.goto('/settings/integrations?tab=browse');

  const tile = page.getByRole('link', { name: /eBarimt/ });

  // Not set up: listed under its category, Government.
  await expect(
    page.getByRole('region', { name: 'Government' }).getByRole('link', { name: /eBarimt/ }),
  ).toBeVisible();
  await expectAccessibleInBothThemes(page);

  // Search and categories narrow the catalog; each gateway is its own tile, connected on its page.
  const gateways = page.getByRole('link', { name: /QPay/ }).filter({ hasNotText: 'QuickQR' });

  await page.getByRole('searchbox', { name: 'Search integrations…' }).fill('qpay');
  await expect(gateways).toBeVisible();
  await expect(tile).toBeHidden();
  await expect(gateways).toHaveAttribute('href', '/settings/integrations/qpay');
  await page.getByRole('searchbox', { name: 'Search integrations…' }).fill('');
  await page.getByRole('button', { name: 'Government' }).click();
  await expect(tile).toBeVisible();
  await expect(gateways).toBeHidden();

  await tile.click();
  await expect(page.getByRole('heading', { name: 'eBarimt', level: 1 })).toBeVisible();
  await expect(page.getByText('Not set up', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Set up' }).click();

  // PosAPI isn't called on save; the receipt below fails to reach it, which Activity shows.
  await page.getByLabel('PosAPI address').fill('https://posapi.example.test');
  await page.getByLabel('Company name').fill('E2E Shop');
  await page.getByLabel('Merchant tax number (TIN)').fill('37900846788');
  await page.getByLabel('District code').fill('3505');
  await expectAccessibleInBothThemes(page);
  await page.getByRole('button', { name: 'Set up eBarimt' }).click();

  // On once set up (Connected, or Needs attention on a rerun: an earlier failed receipt stays).
  const sending = page.getByRole('switch', { name: 'Send receipts' });

  await expect(sending).toBeChecked();
  await expect(page.getByText('Not set up', { exact: true })).toBeHidden();

  // Turned off, it stays off.
  await sending.click();
  await expect(page.getByText('Off', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText('Off', { exact: true })).toBeVisible();
  await sending.click();
  await expect(sending).toBeChecked();
  await expect(page.getByText('Off', { exact: true })).toBeHidden();

  // Core's own invoices get receipts too.
  const gateway = await api.integrations.connect({ key: 'test', name: 'Test', keys: {} });
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

  // Connected lists it, flagged, and Activity lists the failed receipt with a retry.
  await page.goto('/settings/integrations');
  await expect(page.getByRole('tab', { name: /Connected/, selected: true })).toBeVisible();
  await expect(tile.getByText('Needs attention')).toBeVisible();
  await tile.click();
  await page.getByRole('tab', { name: 'Activity' }).click();
  await page.getByRole('button', { name: 'Failed' }).click();

  const failed = page.getByRole('listitem').filter({ hasText: `order ${ref}` });

  await expect(failed.getByRole('button', { name: 'Send again' })).toBeVisible();
  await expectAccessibleInBothThemes(page);

  // The invoice shows it too.
  await page.goto('/settings/payments');
  await page.getByRole('button', { name: new RegExp(`Order ${ref}`) }).click();

  const details = page.getByRole('dialog', { name: `Order ${ref}` });

  await expect(details.getByText('Failed')).toBeVisible();
  await expect(details.getByRole('button', { name: 'Send again' })).toBeVisible();
});
