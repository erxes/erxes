import sanitizeHtml from 'sanitize-html';
import { cn } from '@/modules/ui/lib/cn';

/**
 * Knowledge base articles and CMS posts arrive as raw HTML written in the erxes
 * admin. It is sanitised on the server before it reaches the DOM, so a rogue or
 * compromised author cannot inject script, event handlers or framed content
 * into the portal.
 */
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
  /* Anything opened in a new tab must not keep a handle on this window. */
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

/** Exported so server code can clean markup it hands to a client component. */
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
