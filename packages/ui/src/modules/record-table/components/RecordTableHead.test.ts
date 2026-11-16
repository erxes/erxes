import { describe, expect, it } from 'vite-plus/test';
import { nextSort } from './RecordTableHead';

describe('nextSort', () => {
  it('goes ascending, then descending, then off', () => {
    const asc = nextSort(null, 'name');

    expect(asc).toEqual({ by: 'name', direction: 'asc' });

    const desc = nextSort(asc, 'name');

    expect(desc).toEqual({ by: 'name', direction: 'desc' });
    expect(nextSort(desc, 'name')).toBeNull();
  });

  it('starts ascending on another column', () => {
    expect(nextSort({ by: 'name', direction: 'desc' }, 'createdAt')).toEqual({
      by: 'createdAt',
      direction: 'asc',
    });
  });
});
