/* eslint-disable no-console */
import AWS from 'aws-sdk';
import { Engages } from '../db/models';

const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION } = process.env;

AWS.config.update({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION,
});

const sns = new AWS.SNS();
const ses = new AWS.SES();

const createTopic = () =>
  sns
    .createTopic({
      Name: 'aws-ses',
    })
    .promise();

const subscribe = topicArn =>
  sns
    .subscribe({
      TopicArn: topicArn,
      Protocol: 'http',
      Endpoint: `http://34.204.2.252:3300/service/engage/tracker`,
    })
    .promise();

const createConfigSet = () =>
  ses
    .createConfigurationSet({
      ConfigurationSet: {
        Name: 'aws-ses',
      },
    })
    .promise();

const createConfigSetEvent = (configSet, topicArn) =>
  ses
    .createConfigurationSetEventDestination({
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
    })
    .promise();

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
    const { eventType, headers = {} } = Message;

    const engageMessageId = headers.filter(obj => {
      return (obj.name = 'Engagemessageid');
    });

    console.log(Message, engageMessageId, eventType);

    switch (eventType) {
      case 'Open': {
        Engages.updateStats(engageMessageId, 'open');
        break;
      }

      case 'Delivery': {
        Engages.updateStats(engageMessageId, 'delivery');
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
      if (error.code === 'ConfigurationSetAlreadyExists') console.log('Config set already created');
      else console.log(error);
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
          if (error.code === 'EventDestinationAlreadyExists')
            console.log('Event destination already created');
          else console.log(error);
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
