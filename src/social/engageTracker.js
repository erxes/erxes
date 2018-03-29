/* eslint-disable no-console */
import AWS from 'aws-sdk';

const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION } = process.env;

AWS.config.update({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION,
});

const sns = new AWS.SNS();
const ses = new AWS.SES();

const hasTopic = () => {
  sns.listTopics({}, (err, data) => {
    if (err) console.log(err);

    console.log(data);

    const { Topics } = data;

    Topics.forEach(topic => {
      if (topic === 'sns-topic-erxes') {
        return true;
      }
    });
  });

  return false;
};

const hasSubscription = () => {
  sns.listSubscriptionsByTopic({ TopicArn: 'sns-subscription-erxes' }, (err, data) => {
    if (err)
      console.log(err, err.stack); // an error occurred
    else console.log(data); // successful response
  });
};

const hasConfigSet = () => {
  ses.listConfigurationSets({}, (err, data) => {
    if (err)
      console.log(err, err.stack); // an error occurred
    else console.log(data); // successful response
  });
};

const validateType = message => {
  const { type = '' } = message;

  if (type === 'SubscriptionConfirmation') {
    const params = {
      Token: message.Token,
      TopicArn: message.TopicArn,
    };

    sns.confirmSubscription(params, function(err) {
      if (err)
        console.log(err, err.stack); // an error occurred
      else console.log('SNS subscription confirmed successfully'); // successful response
    });
  } else {
    const { Message } = message;
    const { eventType } = Message;
    console.log(Message);

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
        console.log(e.message);
      }

      validateType(message);
    });

    next();
  };
};

const init = () => {
  console.log(hasTopic().toString());
  console.log(hasSubscription());
  console.log(hasConfigSet());
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
