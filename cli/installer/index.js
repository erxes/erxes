var amqplib = require("amqplib");
var open = amqplib.connect(process.env.RABBITMQ_HOST);

var shell = require("shelljs");

var queueName = "managePluginInstall";

// Consumer
open
  .then(function (conn) {
    return conn.createChannel();
  })
  .then(function (ch) {
    return ch.assertQueue(queueName).then(function (ok) {
      console.log("Waiting for installer message .....");

      return ch.consume(queueName, async (msg) => {
        if (msg !== null) {
          var content = msg.content.toString();
          console.log(`Received rpc queue message ${content}`);

          var { data } = JSON.parse(content);

          try {
            shell.cd("..");
            shell.exec(`npm run erxes manage-installation ${data.type} ${data.name}`);
          } catch (e) {
            debugError(
              `Error occurred during callback ${queueName} ${e.message}`
            );
          }

          shell.cd("installer");

          ch.sendToQueue(
            msg.properties.replyTo,
            Buffer.from(JSON.stringify({ status: "success" })),
            {
              correlationId: msg.properties.correlationId,
            }
          );

          ch.ack(msg);
        }
      });
    });
  })
  .catch(console.warn);