
export const internalNoteConsumers = (params: { name, consumeRPCQueue?, generateInternalNoteNotif? }) => {
  const { name, consumeRPCQueue, generateInternalNoteNotif} = params;

  if (generateInternalNoteNotif) {
    consumeRPCQueue(`${name}:generateInternalNoteNotif`, async args => {
      const data = await generateInternalNoteNotif(args);

      return {
        status: 'success',
        data
      };
    });
  }
}