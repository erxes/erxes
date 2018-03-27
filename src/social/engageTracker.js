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

  switch (type) {
    case 'SubscriptionConfirmation': {
      const params = {
        Token: message.Token,
        TopicArn: message.TopicArn,
      };

      sns.confirmSubscription(params, function(err, data) {
        if (err)
          console.log(err, err.stack); // an error occurred
        else console.log(data); // successful response
      });
      break;
    }

    default:
      console.log(message);
      break;
  }
};

const reqMiddleware = () => {
  return (req, res, next) => {
    if (req.headers['x-amz-sns-message-type']) {
      req.headers['content-type'] = 'application/json;charset=UTF-8';
    }

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
