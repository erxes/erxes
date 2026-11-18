import {
  insertEmailLink,
  normalizeLinkUrl,
} from '@/automations/components/builder/nodes/actions/sendEmail/utils/emailLinkUtils';
import { IBlockEditor } from 'erxes-ui';
import { useCallback, useState } from 'react';

/** The link dialog's text and address, inserted into the editor on submit. */
export const useSendEmailLinkDialog = ({
  editor,
  onOpenChange,
}: {
  editor: IBlockEditor;
  onOpenChange: (open: boolean) => void;
}) => {
  const [textValue, setTextValue] = useState('');
  const [urlValue, setUrlValue] = useState('');

  const close = useCallback(() => {
    onOpenChange(false);
    setTextValue('');
    setUrlValue('');
  }, [onOpenChange]);

  // Opening is the caller's; anything else the dialog reports is a close
  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        close();
      }
    },
    [close],
  );

  const handleInsert = useCallback(() => {
    const url = normalizeLinkUrl(urlValue);

    if (!url) {
      return;
    }

    insertEmailLink(editor, url, textValue.trim());
    close();
  }, [editor, urlValue, textValue, close]);

  return {
    textValue,
    urlValue,
    setTextValue,
    setUrlValue,
    canInsert: !!urlValue.trim(),
    close,
    handleOpenChange,
    handleInsert,
  };
};
