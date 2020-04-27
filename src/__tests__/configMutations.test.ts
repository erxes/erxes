import * as sinon from 'sinon';
import * as utils from '../data/utils';
import { graphqlRequest } from '../db/connection';

import { Configs } from '../db/models';
import './setup.ts';

describe('Test configs mutations', () => {
  test('Update configs', async () => {
    const mutation = `
      mutation configsUpdate($configsMap: JSON!) {
        configsUpdate(configsMap: $configsMap)
      }
    `;

    await graphqlRequest(mutation, 'configsUpdate', { configsMap: { dealUOM: ['MNT'], '': '' } });

    const uomConfig = await Configs.getConfig('dealUOM');

    expect(uomConfig.value.length).toEqual(1);
    expect(uomConfig.value[0]).toEqual('MNT');

    // if code is not dealUOM and dealCurrency
    await graphqlRequest(mutation, 'configsUpdate', { configsMap: { code: ['USD'] } });

    const codeConfig = await Configs.getConfig('code');

    expect(codeConfig.value.length).toEqual(1);
    expect(codeConfig.value[0]).toEqual('USD');

    const firebaseMock = sinon.stub(utils, 'initFirebase').callsFake();

    await graphqlRequest(mutation, 'configsUpdate', {
      configsMap: { GOOGLE_APPLICATION_CREDENTIALS_JSON: ['serviceAccount'] },
    });

    const googleConfig = await Configs.getConfig('GOOGLE_APPLICATION_CREDENTIALS_JSON');

    expect(googleConfig.value.length).toEqual(1);
    expect(googleConfig.value[0]).toEqual('serviceAccount');

    firebaseMock.restore();
  });
});
