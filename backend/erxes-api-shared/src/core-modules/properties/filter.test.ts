import { buildPropertyFilter } from './filter';
import { toPropertyRowKey } from './keys';

const encode = (fieldId: string, operator: string, value?: string) =>
  value === undefined
    ? `${encodeURIComponent(fieldId)}:${operator}`
    : `${encodeURIComponent(fieldId)}:${operator}:${encodeURIComponent(value)}`;

const school = toPropertyRowKey('edu', 'school');
const year = toPropertyRowKey('edu', 'year');

describe('buildPropertyFilter', () => {
  it('builds a plain field condition', () => {
    expect(buildPropertyFilter(encode('plan', 'eq', 'pro'))).toEqual([
      { 'propertiesData.plan': { $in: ['pro'] } },
    ]);
  });

  it('matches one entry of a repeating group', () => {
    expect(buildPropertyFilter(encode(school, 'eq', 'MUIS'))).toEqual([
      { 'propertiesData.g:edu': { $elemMatch: { school: { $in: ['MUIS'] } } } },
    ]);
  });

  it('makes both conditions hold for one shared entry', () => {
    const filter = buildPropertyFilter(
      [encode(school, 'eq', 'MUIS'), encode(year, 'gte', '2020')].join(';'),
    );

    expect(filter).toEqual([
      {
        'propertiesData.g:edu': {
          $elemMatch: { school: { $in: ['MUIS'] }, year: { $gte: 2020 } },
        },
      },
    ]);
  });

  it('lets any-row conditions stand on separate entries', () => {
    const filter = buildPropertyFilter(
      [
        encode(toPropertyRowKey('edu', 'school', true), 'eq', 'MUIS'),
        encode(toPropertyRowKey('edu', 'year', true), 'gte', '2020'),
      ].join(';'),
    );

    expect(filter).toEqual([
      { 'propertiesData.g:edu': { $elemMatch: { school: { $in: ['MUIS'] } } } },
      { 'propertiesData.g:edu': { $elemMatch: { year: { $gte: 2020 } } } },
    ]);
  });

  it('keeps entries of different groups apart', () => {
    const filter = buildPropertyFilter(
      [
        encode(school, 'eq', 'MUIS'),
        encode(toPropertyRowKey('work', 'company'), 'eq', 'erxes'),
      ].join(';'),
    );

    expect(filter).toHaveLength(2);
  });

  it('keeps a value containing the separators intact', () => {
    expect(buildPropertyFilter(encode('plan', 'contains', 'a:b/c'))).toEqual([
      { 'propertiesData.plan': { $regex: 'a:b/c', $options: 'i' } },
    ]);
  });

  it('reads nothing from an empty input', () => {
    expect(buildPropertyFilter('')).toEqual([]);
    expect(buildPropertyFilter(null)).toEqual([]);
  });
});
