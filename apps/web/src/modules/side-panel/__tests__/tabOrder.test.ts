import { describe, expect, it } from 'vite-plus/test';
import { leadWith } from '../tabOrder';

const tabs = (...values: string[]) => values.map((value) => ({ value }));
const values = (list: { value: string }[]) => list.map((tab) => tab.value);

describe('leadWith', () => {
  it('puts Activity right after Detail in the panel', () => {
    const ordered = leadWith(
      tabs('detail', 'properties', 'deals', 'activity'),
      'activity',
      'detail',
    );

    expect(values(ordered)).toEqual(['detail', 'activity', 'properties', 'deals']);
  });

  it('puts Activity first on the record page, where Detail is its own column', () => {
    const ordered = leadWith(tabs('properties', 'deals', 'activity'), 'activity', 'detail');

    expect(values(ordered)).toEqual(['activity', 'properties', 'deals']);
  });

  it('keeps the order when the record has no such tab', () => {
    const ordered = leadWith(tabs('detail', 'variants'), 'activity', 'detail');

    expect(values(ordered)).toEqual(['detail', 'variants']);
  });
});
