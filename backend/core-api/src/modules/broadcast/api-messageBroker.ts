import { InterMessage } from 'erxes-api-shared/utils';

let channel: amqplib.Channel | undefined;

export const sendMessage = async (
  queueName: string,
  message: InterMessage,
): Promise<void> => {
  if (!channel) {
    throw new Error(`RabbitMQ channel is ${channel}`);
  }

  queueName = queueName.concat(queuePrefix);

  if (message && !message.thirdService) {
    await checkQueueName(queueName, true);
  }

  try {
    const messageJson = JSON.stringify(message || {});

    if (showInfoDebug()) {
      console.log(`Sending message ${messageJson} to ${queueName}`);
    }

    await channel.assertQueue(queueName);
    await channel.sendToQueue(queueName, Buffer.from(messageJson));
  } catch (e: any) {
    console.error(
      `Error occurred during send queue ${queueName}: ${e.message}`,
    );
  }
};
