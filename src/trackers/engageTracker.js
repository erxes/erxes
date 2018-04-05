/* eslint-disable no-console */
import AWS from 'aws-sdk';
import { EngageMessages } from '../db/models';

const getApi = type => {
  const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION } = process.env;

  AWS.config.update({
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    region: AWS_REGION,
  });

  if (type === 'ses') {
    return new AWS.SES();
  }

  return new AWS.SNS();
};

/*
 * Receives notification from amazon simple notification service
 * And updates engage message status and stats
 */
const handleMessage = async message => {
  const obj = JSON.parse(message);

  const { eventType, mail } = obj;
  const { headers } = mail;

  const engageMessageId = headers.find(obj => obj.name === 'Engagemessageid');
  const mailId = headers.find(obj => obj.name === 'Mailmessageid');

  const type = eventType.toLowerCase();

  await EngageMessages.updateStats(engageMessageId.value, type);

  await EngageMessages.changeDeliveryReportStatus(engageMessageId.value, mailId.value, type);
};

const init = () => {
  const { AWS_CONFIG_SET = '', AWS_ENDPOINT = '' } = process.env;

  if (AWS_CONFIG_SET === '' || AWS_ENDPOINT === '') {
    return console.log('Couldnt locate configs on AWS SES');
  }

  let topicArn = '';

  // Automatically creating aws configs
  getApi('sns')
    // Create Topic
    .createTopic({ Name: AWS_CONFIG_SET })
    .promise()
    // Subscribing to the topic
    .then(result => {
      topicArn = result.TopicArn;

      return getApi('sns')
        .subscribe({
          TopicArn: topicArn,
          Protocol: 'https',
          Endpoint: `${AWS_ENDPOINT}/service/engage/tracker`,
        })
        .promise();
    })
    // Creating configuration set
    .then(() => {
      console.log('Successfully subscribed to the topic');

      return getApi('ses')
        .createConfigurationSet({
          ConfigurationSet: {
            Name: AWS_CONFIG_SET,
          },
        })
        .promise();
    })
    .catch(error => {
      console.log(error.message);
    })
    // Creating event destination for configuration set
    .then(() => {
      console.log('Successfully created config set');

      return getApi('ses')
        .createConfigurationSetEventDestination({
          ConfigurationSetName: AWS_CONFIG_SET,
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
    })
    .catch(error => {
      console.log(error.message);
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

    req.on('end', async () => {
      const message = JSON.parse(chunks.join(''));

      const { Type = '', Message = {}, Token = '', TopicArn = '' } = message;

      if (Type === 'SubscriptionConfirmation') {
        await getApi('sns')
          .confirmSubscription({ Token, TopicArn })
          .promise();

        return res.end('success');
      }

      handleMessage(Message);
    });

    return res.end('success');
  });
};

export const awsRequests = {
  getVerifiedEmails() {
    return getApi('ses')
      .listVerifiedEmailAddresses()
      .promise();
  },
};
