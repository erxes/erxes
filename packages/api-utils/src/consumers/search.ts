import { consumeRPCQueue } from "../messageBroker";

export const searchCunsomers = ({ name, search }) => {
  consumeRPCQueue(`${name}:search`, async args => ({
    status: "success",
    data: await search(args)
  }));
};
