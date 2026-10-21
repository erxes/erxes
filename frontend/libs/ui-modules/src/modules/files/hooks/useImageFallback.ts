import { useState } from 'react';

// Signed links expire; keyed by src so a fresh link is tried again.
export const useImageFallback = (src?: string | null) => {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  return {
    showImage: !!src && failedSrc !== src,
    onError: () => setFailedSrc(src || null),
  };
};
