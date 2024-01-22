import { consumeRPCQueue } from './messageBroker';

export const formConsumers = (params: { name; systemFields? }) => {
  const { name, systemFields } = params;

  if (systemFields) {
    consumeRPCQueue(`${name}:systemFields`, async (args) => {
      const data = await systemFields(args);

      return {
        status: 'success',
        data,
      };
    });
  }
};
