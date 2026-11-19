import { toast } from 'erxes-ui';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { FormPrintView } from '@/inbox/conversation-messages/components/FormPrintView';
import type { IMessage } from '@/inbox/types/Conversation';

const waitForResources = (doc: Document) =>
  Promise.all(
    [
      ...Array.from(doc.querySelectorAll('link[rel="stylesheet"]')),
      ...Array.from(doc.images),
    ].map(
      (element) =>
        new Promise<void>((resolve) => {
          if (element instanceof HTMLImageElement && element.complete) {
            resolve();
            return;
          }
          if (element instanceof HTMLLinkElement && element.sheet) {
            resolve();
            return;
          }
          element.addEventListener('load', () => resolve(), { once: true });
          element.addEventListener('error', () => resolve(), { once: true });
        }),
    ),
  );

export const FormPrintFrame = ({
  message,
  onDone,
}: {
  message: IMessage;
  onDone: () => void;
}) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.inbox' });
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [body, setBody] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const doc = frameRef.current?.contentDocument;
    if (!doc) return;

    document
      .querySelectorAll('style, link[rel="stylesheet"]')
      .forEach((node) => doc.head.appendChild(node.cloneNode(true)));
    setBody(doc.body);
  }, []);

  useEffect(() => {
    const frameWindow = frameRef.current?.contentWindow;
    if (!body || !frameWindow) return;

    let cancelled = false;

    waitForResources(body.ownerDocument)
      .then(() => {
        if (cancelled) return;
        frameWindow.focus();
        frameWindow.print();
      })
      .catch((error: Error) => {
        toast({
          title: t('print-failed', 'Failed to print'),
          description: error.message,
          variant: 'destructive',
        });
      })
      .finally(() => {
        if (!cancelled) onDone();
      });

    return () => {
      cancelled = true;
    };
  }, [body, onDone, t]);

  return (
    <>
      <iframe
        ref={frameRef}
        title={message.content}
        aria-hidden
        className="fixed size-0 border-0"
      />
      {body && createPortal(<FormPrintView {...message} />, body)}
    </>
  );
};
