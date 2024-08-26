import { consumeRPCQueue } from "../messageBroker";

export const automationsCunsomers = ({ name, automations }) => {
  if (automations.receiveActions) {
    consumeRPCQueue(`${name}:automations.receiveActions`, async args => ({
      status: "success",
      data: await automations.receiveActions(args)
    }));
  }
  if (automations?.getRecipientsEmails) {
    consumeRPCQueue(`${name}:automations.getRecipientsEmails`, async args => ({
      status: "success",
      data: await automations.getRecipientsEmails(args)
    }));
  }
  if (automations?.replacePlaceHolders) {
    consumeRPCQueue(`${name}:automations.replacePlaceHolders`, async args => ({
      status: "success",
      data: await automations.replacePlaceHolders(args)
    }));
  }
  if (automations?.checkCustomTrigger) {
    consumeRPCQueue(`${name}:automations.checkCustomTrigger`, async args => ({
      status: "success",
      data: await automations.checkCustomTrigger(args)
    }));
  }
};
