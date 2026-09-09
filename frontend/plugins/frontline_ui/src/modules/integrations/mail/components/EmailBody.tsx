import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';
import { readImage } from 'erxes-ui';
import { IconPhoto } from '@tabler/icons-react';

interface EmailBodyProps {
  body?: string;
  attachments?: { url?: string }[];
}

const REMOTE_SOURCE = /^https?:/i;

const INLINE_SOURCE = /^(data|cid):/i;

const toOrigin = (url: string) => {
  try {
    return new URL(url).origin;
  } catch {
    return '';
  }
};

const resolveImageSource = (value?: string) => {
  const source = (value ?? '').trim();

  if (!source || INLINE_SOURCE.test(source)) {
    return source;
  }

  const resolved = readImage(source);

  try {
    return new URL(resolved, window.location.href).href;
  } catch {
    return resolved;
  }
};

const prepare = (body: string, trusted: Set<string>, showImages: boolean) => {
  const doc = new DOMParser().parseFromString(
    DOMPurify.sanitize(body),
    'text/html',
  );

  let blocked = 0;

  doc.querySelectorAll('img').forEach((image) => {
    const source = resolveImageSource(image.getAttribute('src') ?? '');

    if (!source) {
      image.removeAttribute('src');
      return;
    }

    if (showImages || trusted.has(source) || !REMOTE_SOURCE.test(source)) {
      image.setAttribute('src', source);
      return;
    }

    blocked += 1;
    image.removeAttribute('src');
  });

  doc.querySelectorAll('a').forEach((link) => {
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  });

  return { html: doc.body.innerHTML, blocked };
};

const wrapHtml = (body: string, imageSources: string) =>
  `<!DOCTYPE html><html><head><meta charset="utf-8"/>` +
  `<meta name="viewport" content="width=device-width,initial-scale=1"/>` +
  `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${imageSources}; style-src 'unsafe-inline'"/>` +
  `<style>
    :root{color-scheme:light dark}
    *{box-sizing:border-box}
    html,body{width:100%!important;min-width:0!important;max-width:100%!important;height:auto!important;min-height:0!important;margin:0;padding:4px 0;overflow-x:auto;background:transparent;color:CanvasText;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;overflow-wrap:anywhere;word-break:break-word}
    img,video{max-width:100%;height:auto}
    pre,code{max-width:100%;white-space:pre-wrap;overflow-wrap:anywhere}
    @media (max-width:1024px){
      body *{max-width:100%!important;min-width:0!important}
      div,p,span,a,td,th{overflow-wrap:anywhere!important;word-break:break-word!important;white-space:normal!important}
      div,p,section,article,header,footer,main{width:auto!important}
      img,video{width:auto!important;max-width:100%!important;height:auto!important}
      table{width:100%!important;max-width:100%!important;table-layout:fixed!important;border-collapse:collapse}
      td,th{width:auto!important;max-width:100%!important}
      pre,code{max-width:100%!important;white-space:pre-wrap!important;overflow-wrap:anywhere!important}
    }
  </style></head><body>${body}</body></html>`;

export const EmailBody: React.FC<EmailBodyProps> = ({ body, attachments }) => {
  const { t } = useTranslation('frontline');
  const ref = useRef<HTMLIFrameElement>(null);
  const [h, setH] = useState(80);
  const [showImages, setShowImages] = useState(false);

  const trustedUrls = useMemo(
    () =>
      (attachments ?? [])
        .map((attachment) => resolveImageSource(attachment.url))
        .filter((url) => REMOTE_SOURCE.test(url)),
    [attachments],
  );

  const { html, blocked } = useMemo(
    () => prepare(body ?? '', new Set(trustedUrls), showImages),
    [body, trustedUrls, showImages],
  );

  const imageSources = useMemo(() => {
    const origins = [...new Set(trustedUrls.map(toOrigin).filter(Boolean))];

    return ['data:', ...origins, ...(showImages ? ['https:'] : [])].join(' ');
  }, [trustedUrls, showImages]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame = 0;
    let imageElements: HTMLImageElement[] = [];

    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const doc = el.contentDocument;
        if (!doc?.body) return;

        // The body has auto height, so it can shrink without resetting the
        // iframe viewport and triggering another resize notification.
        const nextHeight = Math.max(
          doc.body.scrollHeight,
          doc.body.offsetHeight,
          40,
        ) + 8;

        if (el.style.height !== `${nextHeight}px`) {
          el.style.height = `${nextHeight}px`;
          setH(nextHeight);
        }
      });
    };

    let previousWidth = 0;
    const widthObserver = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width !== previousWidth) {
        previousWidth = entry.contentRect.width;
        measure();
      }
    });
    widthObserver.observe(el);

    const onLoad = () => {
      const doc = el.contentDocument;
      if (!doc?.body) return;

      imageElements.forEach((image) =>
        image.removeEventListener('load', measure),
      );
      imageElements = Array.from(doc.images);
      imageElements.forEach((image) => image.addEventListener('load', measure));
      measure();
    };

    el.addEventListener('load', onLoad);
    window.addEventListener('resize', measure);

    if (el.contentDocument?.readyState === 'complete') onLoad();

    return () => {
      widthObserver.disconnect();
      cancelAnimationFrame(frame);
      imageElements.forEach((image) =>
        image.removeEventListener('load', measure),
      );
      el.removeEventListener('load', onLoad);
      window.removeEventListener('resize', measure);
    };
  }, [html]);

  if (!body)
    return (
      <p className="py-3 text-sm text-[#5f6368] italic">{t('no-content')}</p>
    );

  return (
    <>
      {blocked > 0 && (
        <div className="mt-1 flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-[11px] text-[#5f6368] dark:text-[#9aa0a6]">
          <IconPhoto size={13} className="flex-none" />
          <span className="flex-1">{t('images-blocked')}</span>
          <button
            type="button"
            className="flex-none font-medium text-info hover:underline"
            onClick={() => setShowImages(true)}
          >
            {t('show-images')}
          </button>
        </div>
      )}
      <iframe
        ref={ref}
        srcDoc={wrapHtml(html, imageSources)}
        style={{ width: '100%', minWidth: 0, height: h }}
        className="block w-full min-w-0 max-w-full border-0 bg-transparent"
        sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        title={t('email-body')}
      />
    </>
  );
};
