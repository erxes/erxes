import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getCurrentAuth } from '~/mastra/requestContext';
import { fetchAttachmentBuffer } from '~/mastra/files/storage';
import { extractFileText } from '~/mastra/files/extract';

// ---------------------------------------------------------------------------
// read-attachment — lets the agent open files the user attached to the chat.
//
// The user message carries an "Attached files" manifest with each file's
// storage key; the model calls this tool with that key to get the extracted
// text (pdf / docx / xlsx / csv / txt / ...). Images never need this tool —
// they are inlined into the message as multimodal parts.
//
// Always bound to every agent (regardless of tool policy) whenever the chat
// transport accepts attachments, so an attached file can always be read.
// ---------------------------------------------------------------------------

export const readAttachmentTool = createTool({
  id: 'read-attachment',
  description:
    'Read the text content of a file the user attached to this conversation. ' +
    'Use the exact "key" listed in the message\'s Attached files manifest. ' +
    'Supports pdf, docx, xlsx/xls, csv, txt, md, json and html. ' +
    'Images are already visible to you directly — never call this for an image.',
  inputSchema: z.object({
    key: z
      .string()
      .min(1)
      .describe(
        'The storage key (or URL) of the attachment, exactly as given in the Attached files manifest',
      ),
    name: z
      .string()
      .optional()
      .describe('The file name, for friendlier errors'),
  }),
  outputSchema: z.object({
    name: z.string(),
    format: z.string(),
    characters: z.number(),
    truncated: z.boolean(),
    content: z.string(),
  }),
  execute: async ({ key, name }) => {
    const auth = getCurrentAuth();
    const subdomain = auth?.subdomain || 'localhost';

    // Lazy import avoids a module cycle (connectionResolvers → … → builtins).
    const { generateModels } = await import('~/connectionResolvers');
    const models = await generateModels(subdomain);
    const settings = await models.MastraSettings.getSettings();

    const fileName = name || key.split('/').pop() || key;
    const { buffer, contentType } = await fetchAttachmentBuffer({
      erxesApiUrl: settings?.erxesApiUrl || 'http://localhost:4000',
      keyOrUrl: key,
      name: fileName,
    });

    const extracted = await extractFileText({
      buffer,
      name: fileName,
      mimeType: contentType,
    });

    return {
      name: fileName,
      format: extracted.format,
      characters: extracted.content.length,
      truncated: extracted.truncated,
      content: extracted.content,
    };
  },
});
