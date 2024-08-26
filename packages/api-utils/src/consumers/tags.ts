import { consumeRPCQueue } from "../messageBroker";

export const tagConsumers = ({ name, tags }) => {
  if (tags.tag) {
    consumeRPCQueue(`${name}:tag`, async args => ({
      status: "success",
      data: await tags.tag(args)
    }));
  }
  if (tags.publishChange) {
    tags.publishChangeAvailable = true;
    consumeRPCQueue(`${name}:publishChange`, async args => ({
      status: "success",
      data: await tags.publishChange(args)
    }));
  }
  if (tags.fixRelatedItems) {
    consumeRPCQueue(`${name}:fixRelatedItems`, async args => ({
      status: "success",
      data: await tags.fixRelatedItems(args)
    }));
  }
};
