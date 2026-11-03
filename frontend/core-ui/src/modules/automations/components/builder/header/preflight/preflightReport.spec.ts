import { byUrgency, toPreflightReport } from './preflightReport';

describe('toPreflightReport', () => {
  it('reads the checks the server sends and drops ones it does not know', () => {
    expect(
      toPreflightReport({
        canActivate: false,
        checks: [
          { key: 'types', status: 'ok', ms: 3, items: [] },
          {
            key: 'settings',
            status: 'bad',
            items: [{ nodeId: 'a1', message: 'Required', path: 'config.x' }],
          },
          { key: 'future', status: 'bad', items: [] },
        ],
      }),
    ).toEqual({
      canActivate: false,
      checks: [
        { key: 'types', status: 'ok', ms: 3, items: [] },
        {
          key: 'settings',
          status: 'bad',
          items: [{ nodeId: 'a1', message: 'Required' }],
        },
      ],
    });
    expect(toPreflightReport(null)).toBeNull();
  });

  it('puts failures first, then warnings', () => {
    expect(
      byUrgency([
        { key: 'types', status: 'ok', items: [] },
        { key: 'reach', status: 'warn', items: [] },
        { key: 'settings', status: 'bad', items: [] },
      ]).map(({ key }) => key),
    ).toEqual(['settings', 'reach', 'types']);
  });
});
