import { getValueByPath } from './outputResolvers';

describe('getValueByPath', () => {
  it('walks a plain path', () => {
    expect(
      getValueByPath(
        { propertiesData: { plan: 'pro' } },
        'propertiesData.plan',
      ),
    ).toEqual({
      found: true,
      value: 'pro',
    });
  });

  it('collects the leaf value of every row in a repeating group', () => {
    const source = {
      propertiesData: {
        'g:edu': [
          { _id: 'r1', school: 'MUIS', year: 2018 },
          { _id: 'r2', school: 'SUIS' },
          { _id: 'r3', year: 2022 },
        ],
      },
    };

    expect(getValueByPath(source, 'propertiesData.g:edu/school')).toEqual({
      found: true,
      value: ['MUIS', 'SUIS'],
    });
  });

  it('finds nothing when no row holds the field', () => {
    const source = { propertiesData: { 'g:edu': [{ _id: 'r1', year: 2018 }] } };

    expect(getValueByPath(source, 'propertiesData.g:edu/school')).toEqual({
      found: false,
    });
  });

  it('finds nothing when the group holds no rows', () => {
    expect(
      getValueByPath(
        { propertiesData: { plan: 'pro' } },
        'propertiesData.g:edu/school',
      ),
    ).toEqual({ found: false });
  });
});
