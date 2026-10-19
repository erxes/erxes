import { useState } from 'react';

// Files uploaded here are stored by key and read through read-file; a full
// URL to anywhere else came in from a conversation — what a customer sent,
// which nobody has looked at yet.
export const isUnverifiedAttachment = (url: string) =>
  /^https?:\/\//i.test(url) && !url.includes('read-file');

// Customer media stays covered until someone chooses to look, so a ticket
// shared with a wider team never opens on something no one checked.
export const useUnverifiedAttachments = () => {
  const [revealedUrls, setRevealedUrls] = useState<string[]>([]);

  return {
    isCovered: (url: string) =>
      isUnverifiedAttachment(url) && !revealedUrls.includes(url),
    reveal: (url: string) =>
      setRevealedUrls((current) =>
        current.includes(url) ? current : [...current, url],
      ),
  };
};
