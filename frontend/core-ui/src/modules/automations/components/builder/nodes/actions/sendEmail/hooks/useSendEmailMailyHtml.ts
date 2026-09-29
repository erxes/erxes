import { TAutomationSendEmailConfig } from '@/automations/components/builder/nodes/actions/sendEmail/states/sendEmailConfigForm';
import { JSONContent, useEmailHtml } from 'erxes-ui';
import { useEffect } from 'react';
import { UseFormSetValue } from 'react-hook-form';

/**
 * Keeps `content` as the html of what the email editor holds: the editor's
 * source is kept for editing, and the html beside it is what the server sends.
 */
export const useSendEmailMailyHtml = (
  contentJson: JSONContent | undefined,
  setValue: UseFormSetValue<TAutomationSendEmailConfig>,
) => {
  const { html } = useEmailHtml(contentJson);

  useEffect(() => {
    if (html) {
      setValue('content', html);
    }
  }, [html, setValue]);
};
