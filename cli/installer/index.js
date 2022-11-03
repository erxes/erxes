
var amqplib = require('amqplib');
var shell = require('shelljs');

var open = amqplib.connect(process.env.RABBITMQ_HOST);
var queueName = 'managePluginInstall';

// Consumer
open
  .then(function(conn) {
    return conn.createChannel();
  })
  .then(function(ch) {
    return ch.assertQueue(queueName).then(function(ok) {
      console.log('Waiting for installer message .....');

      ch.consume(
        queueName,
        async msg => {
          if (msg !== null) {
            var content = msg.content.toString();

            console.log(`Received rpc queue message ${content}`);

            var { data } = JSON.parse(content);

            ch.sendToQueue(
              'core:manage-installation-notification',
              Buffer.from(JSON.stringify({ ...data, message: 'started' } )),
            );

            try {
              shell.cd('..');
              shell.exec(
                `npm run erxes manage-installation ${data.type} ${data.name}`
              );
            } catch (e) {
              debugError(
                `Error occurred during callback ${queueName} ${e.message}`
              );
            }

            shell.cd('installer');

            ch.sendToQueue(
              'core:manage-installation-notification',
              Buffer.from(JSON.stringify({ ...data, message: 'done' } )),
            );

            ch.ack(msg);

            console.log(`Done ${content}`);
          }
        },
        { noAck: false }
      );
    });
  })
  .catch(console.warn);