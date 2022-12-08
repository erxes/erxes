import React, { useEffect, useState } from 'react';

export const useExternalScript = (url) => {
  let [state, setState] = useState(url ? 'loading' : 'idle');

  let script: HTMLScriptElement | Element | null = document.querySelector(
    `script[src="${url}"]`
  );

  useEffect(() => {
    if (!url) {
      setState('idle');
      return;
    }

    const handleScript = (e) => {
      setState(e.type === 'load' ? 'ready' : 'error');
    };

    if (!script) {
      const externalScript = document.createElement(
        'script'
      ) as HTMLScriptElement;
      externalScript.type = 'application/javascript';
      externalScript.src = url;
      externalScript.async = true;
      document.body.appendChild(externalScript);
      externalScript.addEventListener('load', handleScript);
      externalScript.addEventListener('error', handleScript);

      script = externalScript;
    }

    script.addEventListener('load', handleScript);
    script.addEventListener('error', handleScript);

    return () => {
      if (script) {
        script.removeEventListener('load', handleScript);
        script.removeEventListener('error', handleScript);
      }
    };
  }, [url]);

  return state;
};
