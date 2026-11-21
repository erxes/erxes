import type { DataExtensionRollup } from '@erxes/core-contract';
import type { z } from 'zod';
import { describe, expect, it } from 'vite-plus/test';
import { useTestDatabase } from './db';
import { useTwoOrgs } from './support';

const ruled = (path: string, op: string, value: unknown) =>
  JSON.stringify({ match: 'all', rules: [{ path, op, value }] });

describe('Data Extensions: formulas, rollups and auto numbers', () => {
  useTestDatabase();

  const t = useTwoOrgs();

  /** Clients and their invoices; two invoices exist before the invoice number does. */
  const setUp = async () => {
    const owner = t.owner();

    for (const [key, singularLabel, pluralLabel] of [
      ['client', 'Client', 'Clients'],
      ['invoice', 'Invoice', 'Invoices'],
    ] as const) {
      await owner.dataObjects.create({ key, singularLabel, pluralLabel });
    }

    await owner.dataFields.create({
      recordType: 'custom.invoice',
      key: 'amount',
      label: 'Amount',
      type: 'number',
    });
    await owner.dataFields.create({
      recordType: 'custom.invoice',
      key: 'paid',
      label: 'Paid',
      type: 'boolean',
    });
    await owner.dataFields.relate({
      recordType: 'custom.invoice',
      key: 'client',
      label: 'Client',
      targetRecordType: 'custom.client',
      kind: 'manyToOne',
      inverseKey: 'invoices',
      inverseLabel: 'Invoices',
    });

    const acme = await owner.dataRecords.create({ objectKey: 'client', values: { name: 'Acme' } });

    const globex = await owner.dataRecords.create({
      objectKey: 'client',
      values: { name: 'Globex' },
    });

    for (const [amount, paid, client] of [
      [400, false, acme.id],
      [100, true, acme.id],
    ] as const) {
      await owner.dataRecords.create({
        objectKey: 'invoice',
        values: { name: `Invoice ${amount}`, amount, paid, client },
      });
    }

    return { acme, globex };
  };

  const invoices = async (input: { filter?: string; sortField?: string } = {}) =>
    (
      await t.member().dataRecords.list({ objectKey: 'invoice', sortDirection: 'asc', ...input })
    ).data.map((row) => row.values);

  it('numbers records, the ones made before the number too', async () => {
    const { acme } = await setUp();
    const owner = t.owner();

    await owner.dataFields.create({
      recordType: 'custom.invoice',
      key: 'number',
      label: 'Number',
      type: 'autoNumber',
      settings: { prefix: 'INV-', digits: 4 },
    });
    await owner.dataRecords.create({
      objectKey: 'invoice',
      values: { name: 'Invoice 50', amount: 50, paid: false, client: acme.id },
    });

    expect((await invoices({ sortField: 'number' })).map((row) => row.number)).toEqual([
      'INV-0001',
      'INV-0002',
      'INV-0003',
    ]);
    await expect(
      owner.dataRecords.create({ objectKey: 'invoice', values: { name: 'x', number: 'INV-9' } }),
    ).rejects.toMatchObject({ code: 'INVALID_INPUT' });
    await expect(
      owner.dataFields.create({
        recordType: 'core.customer',
        key: 'number',
        label: 'Number',
        type: 'autoNumber',
      }),
    ).rejects.toMatchObject({ code: 'INVALID_TYPE' });
  });

  it('works out formulas, through a relation too, and filters and sorts by them', async () => {
    const owner = t.owner();

    await owner.dataFields.create({
      recordType: 'custom.invoice',
      key: 'tax',
      label: 'Tax',
      type: 'formula',
      settings: { formula: { expression: 'ROUND({amount} * 0.1, 2)' } },
    });
    await owner.dataFields.create({
      recordType: 'custom.invoice',
      key: 'title',
      label: 'Title',
      type: 'formula',
      settings: { formula: { expression: 'CONCAT({client.name}, " ", {number})' } },
    });

    expect(await invoices({ sortField: 'tax' })).toMatchObject([
      { amount: 50, tax: 5, title: 'Acme INV-0003' },
      { amount: 100, tax: 10, title: 'Acme INV-0002' },
      { amount: 400, tax: 40, title: 'Acme INV-0001' },
    ]);
    expect(
      (await invoices({ filter: ruled('subject.tax', 'gte', 10) })).map((row) => row.amount),
    ).toEqual(expect.arrayContaining([100, 400]));
    expect(await invoices({ filter: ruled('subject.tax', 'gte', 10) })).toHaveLength(2);
    await expect(
      owner.dataFields.create({
        recordType: 'custom.invoice',
        key: 'broken',
        label: 'Broken',
        type: 'formula',
        settings: { formula: { expression: '{amount} + "a"' } },
      }),
    ).rejects.toMatchObject({
      code: 'INVALID_INPUT',
      // At the `+` that can't add text.
      data: { issues: [{ path: ['settings', 'formula', 'expression', 9] }] },
    });
  });

  it('rolls up the records a relation links', async () => {
    const owner = t.owner();

    const rollup = (key: string, settings: Omit<z.input<typeof DataExtensionRollup>, 'relation'>) =>
      owner.dataFields.create({
        recordType: 'custom.client',
        key,
        label: key,
        type: 'rollup',
        settings: { rollup: { relation: 'invoices', ...settings } },
      });

    await rollup('invoiceCount', { op: 'count' });
    await rollup('billed', { op: 'sum', field: 'amount' });
    await rollup('unpaid', { op: 'sum', field: 'amount', where: 'NOT {paid}' });
    await owner.dataFields.create({
      recordType: 'custom.client',
      key: 'status',
      label: 'Status',
      type: 'formula',
      settings: { formula: { expression: 'IF({unpaid} > 100, "chase", "ok")' } },
    });

    const { data } = await t.member().dataRecords.list({
      objectKey: 'client',
      sortField: 'billed',
      sortDirection: 'desc',
    });

    expect(data.map((row) => row.values)).toMatchObject([
      { name: 'Acme', invoiceCount: 3, billed: 550, unpaid: 450, status: 'chase' },
      // A sum of no records is 0.
      { name: 'Globex', invoiceCount: 0, billed: 0, unpaid: 0, status: 'ok' },
    ]);

    const chased = await t.member().dataRecords.list({
      objectKey: 'client',
      filter: ruled('subject.status', 'eq', 'chase'),
    });

    expect(chased.data.map((row) => row.label)).toEqual(['Acme']);
    await expect(rollup('nope', { op: 'sum', field: 'missing' })).rejects.toMatchObject({
      code: 'INVALID_INPUT',
    });
  });

  it('reads core records’ own fields, prices in their major unit', async () => {
    const owner = t.owner();
    const customer = await owner.customers.create({ firstName: 'Nora', lastName: 'Bold' });

    const product = await owner.products.create({
      kind: 'goods',
      name: 'Phone X',
      code: 'PX-1',
      price: 1_200_000_00,
    });

    await owner.dataFields.create({
      recordType: 'core.customer',
      key: 'greeting',
      label: 'Greeting',
      type: 'formula',
      settings: { formula: { expression: 'CONCAT("Hi ", {firstName}, " ", LEFT({lastName}, 1))' } },
    });
    await expect(
      owner.dataValues.get({ recordType: 'core.customer', recordId: customer.id }),
    ).resolves.toMatchObject({ values: { greeting: 'Hi Nora B' } });
    await expect(
      owner.dataFields.preview({
        recordType: 'core.product',
        formula: { expression: '{price} * 1.1' },
        recordId: product.id,
      }),
    ).resolves.toEqual({ result: 'number', value: 1_320_000 });
  });

  it('keeps the fields a formula reads, and refuses a loop', async () => {
    const owner = t.owner();
    const fields = (await owner.dataFields.list({ recordType: 'custom.invoice' })).data;

    const byKey = (key: string) => {
      const found = fields.find((field) => field.key === key);

      if (!found) throw new Error(`Expected the ${key} field`);

      return found;
    };

    await expect(owner.dataFields.archive({ id: byKey('amount').id })).rejects.toMatchObject({
      code: 'FIELD_IN_USE',
    });
    await expect(
      owner.dataFields.update({ id: byKey('paid').id, key: 'settled' }),
    ).rejects.toMatchObject({ code: 'FIELD_IN_USE' });

    const double = await owner.dataFields.create({
      recordType: 'custom.invoice',
      key: 'double',
      label: 'Double tax',
      type: 'formula',
      settings: { formula: { expression: '{tax} * 2' } },
    });

    await expect(
      owner.dataFields.update({
        id: byKey('tax').id,
        settings: { formula: { expression: '{double} + 1' } },
      }),
    ).rejects.toMatchObject({ code: 'INVALID_INPUT' });
    await owner.dataFields.archive({ id: double.id });
    await expect(owner.dataFields.archive({ id: byKey('title').id })).resolves.toMatchObject({
      status: 'archived',
    });
  });
});
