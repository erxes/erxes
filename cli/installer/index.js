
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

            var sendMessage = (ch, message) => {
              console.log(message);

              ch.sendToQueue(
                'core:manage-installation-notification',
                Buffer.from(JSON.stringify({ ...data, message } )),
              );
            }

            sendMessage(ch, 'started');

            await runCommand('..', 'cd');

            // Update configs.json
            await runCommand(`npm run erxes installer-update-configs ${data.type} ${data.name}`);

            if (data.type === 'install') {
              sendMessage(ch, 'Running up ....');
              await runCommand(`npm run erxes up -- --fromInstaller`);

              sendMessage(ch, 'Syncing ui ....');
              await runCommand(`npm run erxes syncui ${data.name}`);

              sendMessage(ch, 'Restarting coreui ....');
              await runCommand(`npm run erxes restart coreui`);

              sendMessage(ch, 'Waiting for 10 seconds for plugin api....');
              await sleep(10000);

              sendMessage(ch, 'Restarting gateway ...');
              await runCommand(`npm run erxes restart gateway`);
            }

            if (data.type === 'uninstall') {
              sendMessage(ch, 'Running up');
              await runCommand(`npm run erxes up -- --fromInstaller`);

              sendMessage(ch, `Removing ${data.name} service ....`);
              await runCommand(`npm run erxes remove-service erxes_plugin_${data.name}_api`);

              sendMessage(ch, `Restarting coreui ....`);
              await runCommand(`npm run erxes restart coreui`);

              sendMessage(ch, `Restarting gateway ....`);
              await runCommand(`npm run erxes restart gateway`);
            }

            await runCommand('installer', 'cd');

            sendMessage(ch, `done`);

            ch.ack(msg);

            console.log(`Done ${content}`);
          }
        },
        { noAck: false }
      );
    });
  })
  .catch(console.warn);