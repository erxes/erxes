import { getContext } from "./utils";

export const customCode = async ({ action, execution }) => {
  let codeStr: string = action.config.code
  if (!codeStr || !codeStr.includes('exports.main = ')) {
    codeStr = '() => {}';
  }
  const exports: { main: any } = { main: undefined };

  const Code = new Function('exports', 'execution', 'context', codeStr);
  Code(exports, execution, await getContext(execution));

  const result = await exports.main(execution, await getContext(execution));

  return result;
}
