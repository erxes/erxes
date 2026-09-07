import { sendTRPCMessage } from '../../utils/trpc';
import { buildSetPropertyModifier } from './utils';

jest.mock('../../utils/trpc', () => ({ sendTRPCMessage: jest.fn() }));
jest.mock('nanoid', () => ({
  ...jest.requireActual('nanoid'),
  nanoid: () => 'row1',
}));

const mockedSendTRPCMessage = jest.mocked(sendTRPCMessage);

const execution = {} as Parameters<
  typeof buildSetPropertyModifier
>[0]['execution'];

const build = (rules: { field: string; operator: string; value?: unknown }[]) =>
  buildSetPropertyModifier({ subdomain: 'test', rules, execution });

describe('buildSetPropertyModifier · repeating groups', () => {
  beforeEach(() => {
    mockedSendTRPCMessage.mockReset();
    // validateFieldValues echoes what it was given
    mockedSendTRPCMessage.mockImplementation(
      async ({ input }: never) => (input as { data: unknown }).data,
    );
  });

  it('appends one row carrying every rule of the same group', async () => {
    const modifier = await build([
      { field: 'propertiesData.g:edu/school', operator: 'set', value: 'MUIS' },
      { field: 'propertiesData.g:edu/year', operator: 'set', value: '2020' },
    ]);

    expect(modifier).toEqual({
      $push: {
        // a numeric string is evaluated to a number before it is stored
        'propertiesData.g:edu': { school: 'MUIS', year: 2020, _id: 'row1' },
      },
    });
  });

  it('keeps a plain field on $set beside an appended row', async () => {
    const modifier = await build([
      { field: 'propertiesData.plan', operator: 'set', value: 'pro' },
      { field: 'propertiesData.g:edu/school', operator: 'set', value: 'MUIS' },
    ]);

    expect(modifier.$set).toEqual({ 'propertiesData.plan': 'pro' });
    expect(modifier.$push).toEqual({
      'propertiesData.g:edu': { school: 'MUIS', _id: 'row1' },
    });
  });

  it('appends nothing when every rule of the group resolves empty', async () => {
    const modifier = await build([
      { field: 'propertiesData.g:edu/school', operator: 'set', value: '' },
    ]);

    expect(modifier.$push).toBeUndefined();
  });
});
