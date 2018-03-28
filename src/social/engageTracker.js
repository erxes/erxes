/* eslint-disable no-console */
import AWS from 'aws-sdk';

const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION } = process.env;

AWS.config.update({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION,
});

const sns = new AWS.SNS();

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

export const trackEngages = expressApp => {
  expressApp.use(reqMiddleware());

  expressApp.get(`/service/engage/tracker`, (req, res) => {
    res.end('success');
  });

  expressApp.post(`/service/engage/tracker`, (req, res) => {
    res.end('success');
  });
};
