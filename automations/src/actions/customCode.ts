import { getContext } from "./utils";

export const customCode = async ({ action, execution }) => {
  let codeStr: string = action.config.code
  if (!codeStr || !codeStr.includes('exports.main = async (execution, context) => ')) {
    return 'not valid code: exports.main = async (execution, context)'
  }
  const exports: { main: any } = { main: undefined };

  const Code = new Function('exports', 'execution', 'context', codeStr);
  const context = await getContext(execution);
  Code(exports, execution, context);

  await exports.main(execution, context);

  return context.result;
}
