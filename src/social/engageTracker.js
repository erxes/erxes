/* eslint-disable no-console */
import AWS from 'aws-sdk';

const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, MAIN_APP_DOMAIN } = process.env;

AWS.config.update({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION,
});

const sns = new AWS.SNS();
const ses = new AWS.SES();

const createTopic = () =>
  new Promise((resolve, reject) =>
    sns.createTopic(
      {
        Name: 'aws-ses',
      },
      (error, result) => {
        if (error) return reject(error);

        return resolve(result);
      },
    ),
  );

const subscribe = topicArn =>
  new Promise((resolve, reject) =>
    sns.subscribe(
      {
        TopicArn: topicArn,
        Protocol: 'http',
        Endpoint: `${MAIN_APP_DOMAIN}/service/engage/tracker`,
      },
      (error, result) => {
        if (error) return reject(error);

        return resolve(result);
      },
    ),
  );

const hasConfigSet = () => {
  ses.listConfigurationSets({}, (error, result) => {
    if (error) console.log(error);
    else {
      const { ConfigurationSets } = result;

      ConfigurationSets.forEach(configSet => {
        if (configSet.Name === 'aws-ses') {
          return true;
        }
      });

      return false;
    }
  });
};

const createConfigSet = () => console.log(hasConfigSet().toString());
new Promise((resolve, reject) =>
  ses.createConfigurationSet(
    {
      ConfigurationSet: {
        Name: 'aws-ses',
      },
    },
    (error, result) => {
      if (error) return reject(error);

      return resolve(result);
    },
  ),
);

const createConfigSetEvent = (configSet, topicArn) =>
  new Promise((resolve, reject) =>
    ses.createConfigurationSetEventDestination(
      {
        ConfigurationSetName: configSet,
        EventDestination: {
          MatchingEventTypes: [
            'send',
            'reject',
            'bounce',
            'complaint',
            'delivery',
            'open',
            'click',
            'renderingFailure',
          ],
          Name: 'aws-ses',
          Enabled: true,
          SNSDestination: {
            TopicARN: topicArn,
          },
        },
      },
      (error, result) => {
        if (error) return reject(error);

        return resolve(result);
      },
    ),
  );

const validateType = message => {
  const { type = '' } = message;

  if (type === 'SubscriptionConfirmation') {
    const params = {
      Token: message.Token,
      TopicArn: message.TopicArn,
    };

    sns.confirmSubscription(params, err => {
      if (err)
        return console.log('SNS subscription confirmation error', err); // an error occurred
      else console.log('SNS subscription confirmed successfully'); // successful response
    });
  } else {
    const { Message } = message;
    const { eventType } = Message;

    switch (eventType) {
      case 'Open': {
        break;
      }

      case 'Delivery': {
        break;
      }

      case 'Send': {
        break;
      }
    }
  }
};

const reqMiddleware = () => {
  return (req, res, next) => {
    const chunks = [];

    req.setEncoding('utf8');
    req.on('data', chunk => {
      chunks.push(chunk);
    });
    req.on('end', () => {
      let message;

      try {
        message = JSON.parse(chunks.join(''));
      } catch (e) {
        // catch a JSON parsing error
        console.log('JSON Parse error', e.message);
      }

      validateType(message);
    });

    next();
  };
};

const init = () => {
  let configSet = 'aws-ses';

  createConfigSet()
    .then(result => {
      console.log('Successfully created config set', result);
    })
    .catch(error => {
      console.log('createConfigSet error', error);
    });

  createTopic()
    .then(result => {
      console.log('Successfully created topic', result.TopicArn);

      subscribe(result.TopicArn)
        .then(result => {
          console.log('Successfully subscribed to the topic', result.SubscriptionArn);
        })
        .catch(error => {
          console.log('subscribe error', error);
        });

      createConfigSetEvent(configSet, result.TopicArn)
        .then(result => {
          console.log('Successfully created config set event destination', result);
        })
        .catch(error => {
          console.log('createConfigSetEvent error', error);
        });
    })
    .catch(error => {
      console.log('createTopic error', error);
    });
};

export const trackEngages = expressApp => {
  init();

  expressApp.use(reqMiddleware());

  expressApp.get(`/service/engage/tracker`, (req, res) => {
    res.end('success');
  });

  expressApp.post(`/service/engage/tracker`, (req, res) => {
    res.end('success');
  });
};
