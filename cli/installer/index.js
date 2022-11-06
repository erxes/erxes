
var amqplib = require('amqplib');
var shell = require('shelljs');

var open = amqplib.connect(process.env.RABBITMQ_HOST);
var queueName = 'managePluginInstall';

var runCommand = (command, method='exec') => {
  return new Promise((resolve) => {
    setTimeout(() => {
      shell[method](command);
      resolve('done');
    }, 500)
  });
}

var sleep = ms => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};

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

            await runCommand('..', 'cd');

            // Update configs.json
            await runCommand(`npm run erxes installer-update-configs ${data.type} ${data.name}`);

            if (data.type === 'install') {
              console.log('Running up ....');
              await runCommand(`npm run erxes up -- --fromInstaller`);

              console.log('Syncing ui ....');
              await runCommand(`npm run erxes syncui ${data.name}`);

              await runCommand(`npm run erxes restart coreui`);

              console.log('Waiting for 10 seconds ....');
              await sleep(10000);

              console.log(`Restarting gateway`);
              await runCommand(`npm run erxes restart gateway`);
            }

            if (data.type === 'uninstall') {
              console.log('Running up ....');
              await runCommand(`npm run erxes up -- --fromInstaller`);

              console.log(`Removing ${data.name} service ....`);
              await runCommand(`npm run erxes remove-service erxes_plugin_${data.name}_api`);

              console.log(`Restarting coreui`);
              await runCommand(`npm run erxes restart coreui`);

              console.log(`Restarting gateway`);
              await runCommand(`npm run erxes restart gateway`);
            }

            await runCommand('installer', 'cd');

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