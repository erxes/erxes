import { CORE_API_PREFIX } from '@erxes/core-contract';
import type { BroadcastChannel, Db, EmailNode } from '@erxes/core-db';
import { render, renderText } from '@maily-to/render';
import { is } from '@maily-to/shared';
import { fail } from '~/http/errors';
import { appLink } from '~/modules/email/email';

/** A field as the `{{ name | fallback }}` placeholder each copy fills with its customer's value. */
const toPlaceholder = ({ variable, fallback }: { variable: string; fallback?: string }) =>
  fallback?.trim() ? `{{ ${variable} | ${fallback.trim()} }}` : `{{ ${variable} }}`;

/** Where the editor's pictures live: core's path, which a mail client needs in full. */
const PUBLIC_FILES = `${CORE_API_PREFIX}/files/public/`;

const PICTURE_ATTRS = ['src', 'image'];

/** The document with core's own picture paths made full addresses under `origin`. */
const withOrigin = (node: EmailNode, origin: string): EmailNode => {
  const attrs = node.attrs && { ...node.attrs };

  for (const key of PICTURE_ATTRS) {
    const value = attrs?.[key];

    if (attrs && typeof value === 'string' && value.startsWith(PUBLIC_FILES)) {
      attrs[key] = `${origin}${value}`;
    }
  }

  return {
    ...node,
    ...(attrs && { attrs }),
    ...(node.content && { content: node.content.map((child) => withOrigin(child, origin)) }),
  };
};

const refuse = (field: 'body' | 'content', message: string) =>
  fail('INVALID_INPUT', message, { issues: [{ path: [field], message }] });

/** Nodes that show something by themselves, without any text. */
const SHOWN = new Set(['variable', 'image', 'inlineImage', 'button', 'horizontalRule', 'linkCard']);

/** Whether the document holds anything to send: text, a field, a picture, a button … */
const hasContent = (node: EmailNode): boolean =>
  SHOWN.has(node.type) ||
  Boolean(node.text?.trim()) ||
  (node.content ?? []).some((child) => hasContent(child));

/**
 * An email's message rendered once, when it is saved: the HTML and its plain-text part,
 * each placeholder left for the recipient's value. An empty document sends nothing.
 */
const renderDocument = async (content: EmailNode | null, origin: string) => {
  if (!content || !hasContent(content)) return { html: null, body: '' };

  const document = withOrigin(content, origin);

  if (!is.node(document)) throw refuse('content', 'The email’s content is not a document');

  const config = { variableFormatter: toPlaceholder };
  const [html, body] = await Promise.all([render(document, config), renderText(document, config)]);

  return { html, body: body.trim() };
};

/**
 * The columns a broadcast's content writes. SMS keeps its text in `body`. An email keeps
 * the editor's document in `content`, rendered here into `html` and its text part (`body`),
 * so no HTML a client wrote is ever sent.
 */
export const contentColumns = async (
  client: Db,
  channel: BroadcastChannel,
  changes: { body?: string; content?: EmailNode | null },
) => {
  if (channel === 'sms') {
    if (changes.content) throw refuse('content', 'An SMS is text: send it as body');

    return changes.body === undefined ? {} : { body: changes.body };
  }

  if (changes.body) throw refuse('body', 'An email’s text comes from its content');

  if (changes.content === undefined) return {};

  return {
    content: changes.content,
    ...(await renderDocument(changes.content, await appLink(client, ''))),
  };
};
