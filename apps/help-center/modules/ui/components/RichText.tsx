import sanitizeHtml from 'sanitize-html';
import { cn } from '@/modules/ui/lib/cn';

const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    ...sanitizeHtml.defaults.allowedTags,
    'img',
    'figure',
    'figcaption',
    'h1',
    'h2',
    'video',
    'source',
  ],
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    '*': ['class', 'style'],
    a: ['href', 'name', 'target', 'rel', 'title'],
    img: ['src', 'srcset', 'alt', 'title', 'width', 'height', 'loading'],
    video: ['src', 'poster', 'controls', 'width', 'height'],
    source: ['src', 'type'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['http', 'https', 'data'] },
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: attribs.target
        ? { ...attribs, rel: 'noopener noreferrer' }
        : attribs,
    }),
  },
  disallowedTagsMode: 'discard',
};

export const sanitizePortalHtml = (html: string): string =>
  sanitizeHtml(html, OPTIONS);

export const RichText = ({
  html,
  className,
}: {
  html: string;
  className?: string;
}) => (
  <div
    className={cn('kb-article', className)}
    dangerouslySetInnerHTML={{ __html: sanitizePortalHtml(html) }}
  />
);
