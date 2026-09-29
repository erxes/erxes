import {
  collectPlaceholderPaths,
  documentPlaceholderResolver,
  IAutomationExecutionDocument,
  replaceOutputPlaceholders,
  TPlaceholderResolver,
} from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { normalizeEmailActionPlaceholders } from './utils';

export const documentResolver = (
  subdomain: string,
  target?: { _id?: string },
): TPlaceholderResolver =>
  documentPlaceholderResolver({
    print: (documentId) =>
      sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'query',
        module: 'documents',
        action: 'print',
        input: {
          _id: documentId,
          replacerIds: target?._id ? [target._id] : [],
          config: {},
        },
        defaultValue: '',
      }),
    findContent: async (documentId) =>
      (
        await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'query',
          module: 'documents',
          action: 'findOne',
          input: { query: { _id: documentId } },
          defaultValue: null,
        })
      )?.content,
  });

/**
 * The execution's outputs as a resolver. Outputs resolve in one batch, so
 * every path the texts mention is looked up up front; a path this misses is
 * simply left for the next resolver.
 */
export const outputResolver = async ({
  subdomain,
  execution,
  targetType,
  texts,
}: {
  subdomain: string;
  execution: IAutomationExecutionDocument;
  targetType: string;
  texts: (string | undefined)[];
}): Promise<TPlaceholderResolver> => {
  const paths = [
    ...new Set(texts.flatMap((text) => collectPlaceholderPaths(text))),
  ].filter((path) => !path.startsWith('document.'));

  const tokens = Object.fromEntries(
    paths.map((path) => [
      path,
      normalizeEmailActionPlaceholders(`{{ ${path} }}`, targetType),
    ]),
  );

  const resolved = paths.length
    ? await replaceOutputPlaceholders({ subdomain, execution, values: tokens })
    : {};

  return (path) => {
    const value = resolved[path];

    // A token handed back as written is one no output owns.
    if (value === undefined || value === tokens[path]) {
      return undefined;
    }

    return value === null || value === '' ? null : String(value);
  };
};
