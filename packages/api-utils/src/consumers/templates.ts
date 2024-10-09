import { consumeRPCQueue } from "../messageBroker";

export const templatesCunsomers = ({ name, templates }) => {
  if (templates.useTemplate) {
    consumeRPCQueue(`${name}:templates.useTemplate`, async args => ({
      status: "success",
      data: await templates.useTemplate(args)
    }));
  }

  if (templates.getRelatedContent) {
    consumeRPCQueue(`${name}:templates.getRelatedContent`, async args => ({
      status: 'success',
      data: await templates.getRelatedContent(args),
    }));
  }
};
