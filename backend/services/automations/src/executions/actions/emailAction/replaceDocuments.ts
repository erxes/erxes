import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { renderEmailContent } from './renderEmailContent';

export const replaceDocuments = async (
  subdomain: string,
  content: string,
  target?: { _id?: string },
) => {
  if (!content) {
    return content;
  }

  const documentPlaceholderRegex = /\{\{\s*document\.([\w-]+)\s*\}\}/g;
  const documentIds = [
    ...new Set(
      [...content.matchAll(documentPlaceholderRegex)].map((match) => match[1]),
    ),
  ];

  if (!documentIds.length) {
    return content;
  }

  const replacements = new Map<string, string>();
  const replacerIds = target?._id ? [target._id] : [];

  for (const documentId of documentIds) {
    const documentHtml = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'documents',
      action: 'print',
      input: {
        _id: documentId,
        replacerIds,
        config: {},
      },
      defaultValue: '',
    });

    console.log({ documentHtml });

    const bodyHtml = getDocumentBodyHtml(String(documentHtml));

    if (bodyHtml) {
      replacements.set(documentId, bodyHtml);
      continue;
    }

    const document = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'documents',
      action: 'findOne',
      input: {
        query: { _id: documentId },
      },
      defaultValue: null,
    });

    replacements.set(documentId, renderEmailContent(document?.content || ''));
  }

  return content.replace(
    documentPlaceholderRegex,
    (_placeholder: string, documentId: string) =>
      replacements.get(documentId) || '',
  );
};

const getDocumentBodyHtml = (html: string) => {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

  return bodyMatch?.[1]?.trim() || html;
};
