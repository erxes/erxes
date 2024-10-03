import { consumeRPCQueue } from "../messageBroker";

export const documentsCunsomer = ({ name, documents }) => {
  consumeRPCQueue(`${name}:documents.editorAttributes`, async args => ({
    status: "success",
    data: await documents.editorAttributes(args)
  }));

  consumeRPCQueue(`${name}:documents.replaceContent`, async args => ({
    status: "success",
    data: await documents.replaceContent(args)
  }));

  consumeRPCQueue(`${name}:documents.replaceContentFields`, async args => ({
    status: "success",
    data: await documents.replaceContentFields(args)
  }));
};
