import * as dotenv from 'dotenv';
import { getApi } from '../trackers/engageTracker';

const start = () => {
  // load environment variables
  dotenv.config();

  const { AWS_SES_CONFIG_SET = '', AWS_ENDPOINT = '' } = process.env;

  if (AWS_SES_CONFIG_SET === '' || AWS_ENDPOINT === '') {
    console.log('Couldnt locate configs on AWS SES');
  }

  let topicArn = '';

  // Automatically creating aws configs
  getApi('sns')
    // Create Topic
    .createTopic({ Name: AWS_SES_CONFIG_SET })
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
            Name: AWS_SES_CONFIG_SET,
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
          ConfigurationSetName: AWS_SES_CONFIG_SET,
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
            Name: AWS_SES_CONFIG_SET,
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

start();
