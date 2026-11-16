import { EmailPreviewDevice } from 'erxes-ui';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

/** The sent email's preview: opening it, the device it is drawn for, its header. */
export const useSendEmailResultEmailPreview = (
  from: string,
  subject: string,
) => {
  const { t } = useTranslation('automations');
  const [device, setDevice] = useState<EmailPreviewDevice>('desktop');
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);

  return {
    device,
    setDevice,
    isOpen,
    setIsOpen,
    open,
    senderInitial: (from || '?').charAt(0).toUpperCase(),
    subjectLabel: subject || t('send-email-no-subject'),
  };
};
