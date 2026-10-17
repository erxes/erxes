import { useEffect, useMemo, useRef, useState } from 'react';

import { buildSandboxedSrcDoc, readPreviewHeight } from './htmlSandbox';

export const HtmlPreview = ({
  html,
  title = 'HTML artifact preview',
}: {
  html: string;
  title?: string;
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(320);
  const { channel, srcDoc } = useMemo(() => {
    const channel = crypto.randomUUID();
    return { channel, srcDoc: buildSandboxedSrcDoc(html, channel) };
  }, [html]);

  useEffect(() => {
    setHeight(320);
    const handleMessage = (event: MessageEvent<unknown>) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      const next = readPreviewHeight(event.data, channel);
      if (next !== null) setHeight(next);
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [channel]);

  return (
    <iframe
      ref={iframeRef}
      title={title}
      sandbox="allow-scripts"
      srcDoc={srcDoc}
      referrerPolicy="no-referrer"
      className="block w-full border-0 bg-transparent"
      style={{ height }}
    />
  );
};
