import { useMemo } from 'react';

import { buildSandboxedSrcDoc } from './htmlSandbox';

export const HtmlPreview = ({
  html,
  title = 'HTML artifact preview',
}: {
  html: string;
  title?: string;
}) => {
  const srcDoc = useMemo(() => buildSandboxedSrcDoc(html), [html]);

  return (
    <iframe
      title={title}
      sandbox=""
      srcDoc={srcDoc}
      referrerPolicy="no-referrer"
      className="block h-96 w-full border-0 bg-transparent"
    />
  );
};
