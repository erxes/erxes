import { normalizeLinkUrl } from '@/automations/components/builder/nodes/actions/sendEmail/utils/emailLinkUtils';
import { useCallback, useEffect, useState } from 'react';

/** The toolbar's draft of a link, reset when another link is selected. */
export const useSendEmailLinkToolbar = ({
  url,
  text,
  editLink,
}: {
  url: string;
  text: string;
  editLink: (url: string, text: string) => void;
}) => {
  const [urlValue, setUrlValue] = useState(url);
  const [textValue, setTextValue] = useState(text);

  useEffect(() => {
    setUrlValue(url);
    setTextValue(text);
  }, [url, text]);

  const applyLink = useCallback(
    () => editLink(normalizeLinkUrl(urlValue), textValue),
    [editLink, urlValue, textValue],
  );

  return { urlValue, textValue, setUrlValue, setTextValue, applyLink };
};
