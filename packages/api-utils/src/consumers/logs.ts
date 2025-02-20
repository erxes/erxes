import { consumeRPCQueue } from '../messageBroker';

export const logConsumers = ({ name, logs }) => {
  if (logs.getActivityContent) {
    consumeRPCQueue(`${name}:logs.getActivityContent`, async (args) => ({
      status: 'success',
      data: await logs.getActivityContent(args),
    }));
  }

  if (logs.getContentTypeDetail) {
    consumeRPCQueue(`${name}:logs.getContentTypeDetail`, async (args) => ({
      status: 'success',
      data: await logs.getContentTypeDetail(args),
    }));
  }

  if (logs.collectItems) {
    consumeRPCQueue(`${name}:logs.collectItems`, async (args) => ({
      status: 'success',
      data: await logs.collectItems(args),
    }));
  }

  if (logs.getContentIds) {
    consumeRPCQueue(`${name}:logs.getContentIds`, async (args) => ({
      status: 'success',
      data: await logs.getContentIds(args),
    }));
  }

  if (logs.getSchemaLabels) {
    consumeRPCQueue(`${name}:logs.getSchemaLabels`, (args) => ({
      status: 'success',
      data: logs.getSchemaLabels(args),
    }));
  }
};
