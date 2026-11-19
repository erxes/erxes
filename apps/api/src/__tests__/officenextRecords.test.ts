import { describe, expect, it } from 'vite-plus/test';
import { fieldRow, FieldDocument, uniqueIn } from '../../scripts/officenext/fields';
import { rowsOfRecord, valuesOf } from '../../scripts/officenext/fieldValues';
import { mentionsOf, noteTarget, noteText } from '../../scripts/officenext/notes';
import { ProductDocument, productRow } from '../../scripts/officenext/products';

// Old erxes documents as Mongo returns them: `_id` and loose types.
describe('officenext import: notes', () => {
  const html =
    '<p><a mentioned-user-id="u1">@Bat Dorj</a>&nbsp;please call back</p><p>Price: 5 000 &amp; up</p>';

  it('turns an HTML note into text and keeps who it mentioned', () => {
    expect(noteText(html)).toBe('@Bat Dorj please call back\n\nPrice: 5 000 & up');
    expect(mentionsOf(html)).toEqual(['u1']);
    expect(noteText('<p></p>')).toBe('');
  });

  it('puts notes on core and plugin timelines, never on products', () => {
    expect(noteTarget('core:lead')).toEqual({
      targetType: 'customer',
      source: 'core',
      collection: null,
    });
    expect(noteTarget('tasks:task')).toEqual({
      targetType: 'operation.task',
      source: 'operation',
      collection: 'tasks',
    });
    expect(noteTarget('products:product')).toBeNull();
    expect(noteTarget('core:user')).toBeNull();
  });
});

describe('officenext import: products and custom fields', () => {
  it('archives deleted products and moves prices to the smallest unit', () => {
    const product = ProductDocument.parse({
      _id: 'p1',
      name: 'Airag',
      type: 'service',
      status: 'deleted',
      unitPrice: '12500.5',
      uomId: 'uom1',
      categoryId: 'gone',
    });

    const context = {
      currency: 'MNT',
      units: new Map([['uom1', 'litre']]),
      categories: new Set<string>(),
    };

    const row = productRow(product, context, null, null, []);

    expect([row[1], row[2], row[6], row[8], row[9], row[10]]).toEqual([
      'service',
      'archived',
      null,
      'litre',
      1_250_050,
      'MNT',
    ]);
    expect(row[14]).toBeInstanceOf(Date);
  });

  it('numbers a repeated label and keeps option labels', () => {
    const doc = FieldDocument.parse({
      _id: 'f1',
      text: 'Size',
      code: 'size',
      type: 'select',
      contentType: 'tasks:task',
      groupId: 'g-gone',
      options: ['S', { label: 'Large', value: 'L' }],
      configs: { isRequired: true },
    });

    const taken = { labels: new Set(['operation.task:size']), codes: new Set<string>() };

    const row = fieldRow(
      doc,
      'operation.task',
      { type: 'select', validation: null },
      taken,
      new Set(),
    );

    expect([row[2], row[3], row[4], row[6], row[7], row[13]]).toEqual([
      'Size 2',
      'select',
      ['S', 'Large'],
      null,
      'size',
      true,
    ]);
    expect(uniqueIn(taken.labels, 'operation.task', 'Size')).toBe('Size 3');
  });

  it('types values by the field and prefers customFieldsData over propertiesData', () => {
    const select = { type: 'select', labels: new Map([['L', 'Large']]) };

    expect(valuesOf(select, ['L', 'S', ''])).toEqual([{ text: 'Large' }, { text: 'S' }]);
    expect(valuesOf({ type: 'number', labels: new Map() }, '42')).toEqual([{ number: 42 }]);
    expect(valuesOf({ type: 'number', labels: new Map() }, 'many')).toEqual([]);
    expect(valuesOf({ type: 'date', labels: new Map() }, '2024-03-05T10:00:00Z')).toEqual([
      { date: '2024-03-05' },
    ]);

    const built = rowsOfRecord(
      'c1',
      {
        propertiesData: [
          ['f1', 'S'],
          ['f-gone', 'x'],
        ],
        customFieldsData: [{ field: 'f1', value: 'L' }],
        trackedData: [{ field: 'plan', value: 'pro' }],
      },
      new Map([['f1', select]]),
      new Map([['plan', 'tracked_customer_plan']]),
    );

    expect(built.missing).toEqual(['f-gone']);
    expect(built.rows).toEqual([
      ['c1', 'f1', 0, 'Large', null, null],
      ['c1', 'tracked_customer_plan', 0, 'pro', null, null],
    ]);
  });
});
