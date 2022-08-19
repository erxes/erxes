

export const formConsumers = (params: { name, consumeRPCQueue?, systemFields? }) => {
  const { name, consumeRPCQueue, systemFields } = params;

  if (systemFields) {
    consumeRPCQueue(`${name}:systemFields`, async args => {
      const data = await systemFields(args);

      return {
        status: 'success',
        data
      };
    });
  }
}