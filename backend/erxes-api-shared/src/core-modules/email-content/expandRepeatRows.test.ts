import { expandRepeatRows } from './expandRepeatRows';

const TABLE =
  '<table><tr><th>Name</th><th>Qty</th></tr>' +
  '<tr><td>{{ trigger.productsData.$.name }}</td><td>{{ trigger.productsData.$.quantity }}</td></tr>' +
  '</table><p>{{ trigger.name }}</p>';

describe('expandRepeatRows', () => {
  it('writes the row once per item with the item index', async () => {
    const html = await expandRepeatRows(TABLE, async () => 2);

    expect(html).toBe(
      '<table><tr><th>Name</th><th>Qty</th></tr>' +
        '<tr><td>{{ trigger.productsData.0.name }}</td><td>{{ trigger.productsData.0.quantity }}</td></tr>' +
        '<tr><td>{{ trigger.productsData.1.name }}</td><td>{{ trigger.productsData.1.quantity }}</td></tr>' +
        '</table><p>{{ trigger.name }}</p>',
    );
  });

  it('drops the row for an empty list and asks each list once', async () => {
    const countOf = jest.fn(async () => 0);
    const html = await expandRepeatRows(TABLE + TABLE, countOf);

    expect(html).not.toContain('productsData');
    expect(countOf).toHaveBeenCalledTimes(1);
    expect(countOf).toHaveBeenCalledWith('trigger.productsData');
  });

  it('leaves html without item placeholders untouched', async () => {
    const countOf = jest.fn(async () => 3);
    const html = '<table><tr><td>{{ trigger.name }}</td></tr></table>';

    expect(await expandRepeatRows(html, countOf)).toBe(html);
    expect(countOf).not.toHaveBeenCalled();
  });
});
