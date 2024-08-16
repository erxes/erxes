import { consumeRPCQueue } from "../messageBroker";

export const internalNoteConsumers = ({ name, internalNotes }) => {
  if (internalNotes.generateInternalNoteNotif) {
    consumeRPCQueue(`${name}:generateInternalNoteNotif`, async args => {
      const data = await internalNotes.generateInternalNoteNotif(args);

      return {
        status: "success",
        data
      };
    });
  }
};
