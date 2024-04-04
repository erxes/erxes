import { consumeRPCQueue } from './messageBroker';

export const internalNoteConsumers = (params: {
  name;
  generateInternalNoteNotif?;
}) => {
  const { name, generateInternalNoteNotif } = params;

  if (generateInternalNoteNotif) {
    consumeRPCQueue(`${name}:generateInternalNoteNotif`, async (args) => {
      const data = await generateInternalNoteNotif(args);

      return {
        status: 'success',
        data,
      };
    });
  }
};
