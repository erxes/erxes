import { useEffect } from 'react';

const useScript = (resourceUrl, onLoadCallback) => {
  useEffect(() => {
    const scripts: any = document.getElementsByTagName('script');

    // Go through existing script tags, and return osmbuildings tag when found.
    for (const script of scripts) {
      if (script.src.includes('osmb.js')) {
        console.log('script found');
        return script;
      }
    }

    const script = document.createElement('script');
    script.src = resourceUrl;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      onLoadCallback();
    };

    return () => {
      console.log('remove script');
      document.body.removeChild(script);
    };
  }, [resourceUrl]);
};
export default useScript;
