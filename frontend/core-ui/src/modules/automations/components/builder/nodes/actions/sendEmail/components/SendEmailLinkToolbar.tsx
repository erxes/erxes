import { SendEmailLinkFields } from '@/automations/components/builder/nodes/actions/sendEmail/components/SendEmailLinkFields';
import { normalizeLinkUrl } from '@/automations/components/builder/nodes/actions/sendEmail/utils/emailLinkUtils';
import { LinkToolbarController, LinkToolbarProps } from '@blocknote/react';
import { IconTrash } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Replaces the default link toolbar for one reason only: BlockNote force-prefixes
 * `https://`, which breaks a URL built from a `{{ ... }}` placeholder.
 */
const SendEmailLinkToolbarContent = ({
  url,
  text,
  editLink,
  deleteLink,
  startHideTimer,
  stopHideTimer,
}: LinkToolbarProps) => {
  const { t } = useTranslation('automations');
  const [urlValue, setUrlValue] = useState(url);
  const [textValue, setTextValue] = useState(text);

  useEffect(() => {
    setUrlValue(url);
    setTextValue(text);
  }, [url, text]);

  const applyLink = () => editLink(normalizeLinkUrl(urlValue), textValue);

  return (
    <div
      className="flex w-[420px] flex-col gap-2 rounded-lg border bg-popover p-2 shadow-md"
      onMouseEnter={stopHideTimer}
      onMouseLeave={startHideTimer}
    >
      <SendEmailLinkFields
        textValue={textValue}
        urlValue={urlValue}
        onTextChange={setTextValue}
        onUrlChange={setUrlValue}
        onSubmit={applyLink}
      />
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={deleteLink}>
          <IconTrash />
          {t('remove-link')}
        </Button>
        <Button size="sm" onClick={applyLink}>
          {t('apply')}
        </Button>
      </div>
    </div>
  );
};

export const SendEmailLinkToolbar = () => (
  <LinkToolbarController linkToolbar={SendEmailLinkToolbarContent} />
);
