import Twit from 'twit';
import { connect, disconnect } from './db/connection';
import { Integrations } from './db/models';

export const customCommand = async () => {
  connect();

  const integrations = await Integrations.find({ kind: 'twitter' });
  const { TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET } = process.env;

  for (const integration of integrations) {
    console.log(integration.name); // eslint-disable-line

    // Twit instance
    const twit = new Twit({
      consumer_key: TWITTER_CONSUMER_KEY,
      consumer_secret: TWITTER_CONSUMER_SECRET,
      access_token: integration.twitterData.token,
      access_token_secret: integration.twitterData.tokenSecret,
    });

    const response = await twit.get('account/verify_credentials', { skip_status: true });

    await Integrations.update(
      { _id: integration._id },
      { $set: { 'twitterData.info': response.data } },
    );
  }

  disconnect();
};

customCommand();
