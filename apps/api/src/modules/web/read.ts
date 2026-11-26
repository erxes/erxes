import { extractFromHtml } from '@extractus/article-extractor';
import { AssistantDocumentType } from '@erxes/core-contract';
import { NodeHtmlMarkdown } from 'node-html-markdown';
import { ATTACHMENT_TEXT_MAX, DOCUMENT_FORMATS } from '~/modules/assistant/attachments';
import { documentText } from '~/modules/assistant/documentText';
import { getPage, type Page } from './getPage';

const ACCEPT =
  'text/html,application/xhtml+xml,text/plain;q=0.9,application/pdf;q=0.8,application/json;q=0.7,*/*;q=0.5';

const MEDIA = ['img', 'picture', 'svg', 'video', 'audio', 'iframe', 'figure'];

const HTML = new Set(['text/html', 'application/xhtml+xml']);

const TEXT = /^(text\/|application\/(json|xml|[\w.+-]+\+(json|xml))$)/;

export class UnreadablePage extends Error {}

const fromHtml = async (page: Page) => {
  const html = page.text();
  const article = await extractFromHtml(html, page.url, { contentLengthThreshold: 0 });

  return {
    title: article?.title ?? '',
    text: NodeHtmlMarkdown.translate(article?.content ?? html, { ignore: MEDIA }),
  };
};

const contentOf = async (page: Page) => {
  if (HTML.has(page.mimeType)) return fromHtml(page);

  if (TEXT.test(page.mimeType)) return { title: '', text: page.text() };

  const document = AssistantDocumentType.safeParse(page.mimeType);

  if (document.success) {
    const read = await documentText(
      page.bytes,
      DOCUMENT_FORMATS[document.data],
      ATTACHMENT_TEXT_MAX,
    );

    return { title: '', text: read.text };
  }

  throw new UnreadablePage(`A ${page.mimeType || 'file'} page can't be read as text`);
};

export const readPage = async (url: string) => {
  const page = await getPage(url, { accept: ACCEPT });

  if (page.status >= 400) throw new UnreadablePage(`The page answered ${page.status}`);

  const { title, text } = await contentOf(page);
  const content = text.trim();

  return {
    url: page.url,
    title,
    content: content.slice(0, ATTACHMENT_TEXT_MAX),
    truncated: content.length > ATTACHMENT_TEXT_MAX,
  };
};
