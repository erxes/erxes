/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { receiveTimeLineResponse } from '../../social/twitter';
import { integrationFactory, conversationFactory } from '../../db/factories';
import { Integrations, Conversations, ConversationMessages } from '../../db/models';
import { connect, disconnect } from '../../db/connection';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('twitter integration tracker', () => {
  describe('receive timeline response', () => {
    let _integration;

    const data = {
      in_reply_to_status_id: 1,
      entities: {
        user_mentions: [],
      },
      user: {
        id: 1,
      },
    };

    beforeEach(async () => {
      _integration = await integrationFactory({
        twitterData: {
          id: 1,
        },
      });
    });

    afterEach(async () => {
      await Integrations.remove({});
      await Conversations.remove({});
      await ConversationMessages.remove({});
    });

    it('check delete integration', async () => {
      const response = await receiveTimeLineResponse({
        _id: 'DFAFDFSD',
        twitterData: {},
      });

      expect(response).toBe(null);
    });

    it('receive reply', async () => {
      // non existing conversation =========
      await receiveTimeLineResponse(_integration, data);
      expect(await ConversationMessages.count()).toBe(0);

      // existing conversation ===========
      await conversationFactory({ twitterData: { id: 1 } });

      await receiveTimeLineResponse(_integration, data);

      expect(await ConversationMessages.count()).toBe(1);
    });

    it('user mentions', async () => {
      data.in_reply_to_status_id = null;
      data.entities.user_mentions = [{ id: 1 }];

      await receiveTimeLineResponse(_integration, data);

      expect(await ConversationMessages.count()).toBe(1);
    });
  });
});
