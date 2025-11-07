import { InterMessage } from 'erxes-api-shared/utils';

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
      debugInfo(`Sending message ${messageJson} to ${queueName}`);
    }

    await channel.assertQueue(queueName);
    await channel.sendToQueue(queueName, Buffer.from(messageJson));
  } catch (e) {
    debugError(`Error occurred during send queue ${queueName} ${e.message}`);
  }
};
