import * as sinon from 'sinon';
import cronJobs from '../../cronJobs';

import { accountFactory, integrationFactory } from '../../db/factories';
import { ConversationMessages, Conversations, Integrations } from '../../db/models';
import { utils } from '../../trackers/gmailTracker';

describe('Gmail cronjob test', () => {
  afterEach(async () => {
    // clear
    await Integrations.deleteMany({});
    await Conversations.deleteMany({});
    await ConversationMessages.deleteMany({});
  });

  test('Gmail update integration gmailData test', async () => {
    const _account = await accountFactory({
      kind: 'gmail',
      uid: 'admin@erxes.io',
    });

    const integration = await integrationFactory({
      kind: 'gmail',
      gmailData: {
        accountId: _account._id,
        email: 'admin@erxes.io',
        expiration: '1547701961664',
        historyId: '11055',
      },
    });

    const mock = sinon.stub(utils, 'callWatch').callsFake(() => ({
      data: {
        expiration: 'expiration',
        historyId: 'historyId',
      },
    }));

    await cronJobs.callGmailUsersWatch();

    const updatedIntegration = await Integrations.findOne({ _id: integration._id });

    if (updatedIntegration && updatedIntegration.gmailData) {
      expect(updatedIntegration.gmailData.expiration).toBe('expiration');
      expect(updatedIntegration.gmailData.historyId).toBe('historyId');
    }

    mock.restore(); // unwraps the spy
  });
});
