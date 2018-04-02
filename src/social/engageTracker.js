/* eslint-disable no-console */
import AWS from 'aws-sdk';
import { EngageMessages } from '../db/models';

const {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION,
  AWS_CONFIG_SET,
  AWS_ENDPOINT,
} = process.env;

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
      Name: AWS_CONFIG_SET,
    })
    .promise();

const subscribe = topicArn =>
  sns
    .subscribe({
      TopicArn: topicArn,
      Protocol: 'http',
      Endpoint: AWS_ENDPOINT,
    })
    .promise();

const createConfigSet = () =>
  ses
    .createConfigurationSet({
      ConfigurationSet: {
        Name: AWS_CONFIG_SET,
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
        Name: AWS_CONFIG_SET,
        Enabled: true,
        SNSDestination: {
          TopicARN: topicArn,
        },
      },
    })
    .promise();

const validateType = async message => {
  const { Type = '', Message = {} } = message;

  if (Type === 'SubscriptionConfirmation') {
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
    const obj = JSON.parse(Message);

    const { eventType, mail } = obj;
    const { headers } = mail;

    const engageMessageId = headers.find(obj => obj.name === 'Engagemessageid');
    const mailId = headers.find(obj => obj.name === 'Mailmessageid');

    const type = eventType.toLowerCase();

    await EngageMessages.updateStats(engageMessageId.value, type);

    await EngageMessages.changeDeliveryReportStatus(engageMessageId.value, mailId.value, type);
  }
};

const init = () => {
  let topicArn = '';

  createTopic()
    .then(result => {
      topicArn = result.TopicArn;

      return subscribe(topicArn);
    })
    .then(() => {
      console.log('Successfully subscribed to the topic');

      return createConfigSet();
    })
    .catch(error => {
      if (error.code === 'ConfigurationSetAlreadyExists') console.log('Config set already created');
      else console.log(error);
    })
    .then(() => {
      console.log('Successfully created config set');

      return createConfigSetEvent(AWS_CONFIG_SET, topicArn);
    })
    .then(() => {
      console.log('Successfully created config set event destination');
    })
    .catch(error => {
      if (error.code === 'EventDestinationAlreadyExists')
        console.log('Event destination already created');
      else console.log(error);
    })
    .catch(error => {
      console.log(error);
    });
};

export const trackEngages = expressApp => {
  init();

  expressApp.post(`/service/engage/tracker`, (req, res) => {
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

    res.end('success');
  });
};
