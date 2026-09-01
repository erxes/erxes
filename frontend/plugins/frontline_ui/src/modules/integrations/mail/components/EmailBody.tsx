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
  `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${imageSources}; style-src 'unsafe-inline'"/>` +
  `<style>
    html,body{margin:0;padding:4px 0;font-family:Arial,sans-serif;font-size:14px;line-height:1.6}
    img{max-width:100%}
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
    const onLoad = () => {
      const doc = el.contentDocument;
      if (doc?.body) setH(Math.max(doc.body.scrollHeight + 8, 40));
    };
    el.addEventListener('load', onLoad);
    return () => el.removeEventListener('load', onLoad);
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
        style={{ height: h }}
        className="w-full border-0"
        sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        title={t('email-body')}
      />
    </>
  );
};
