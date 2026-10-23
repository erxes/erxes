import { DirectMailTemplateSelector } from '@/integrations/mail/composer/components/toolbar/DirectMailTemplateSelector';
import { useDirectMailComposerContext } from '@/integrations/mail/composer/hooks/useDirectMailComposerFields';
import { useDirectMailInsertTools } from '@/integrations/mail/composer/hooks/useDirectMailInsertTools';
import { IconPaperclip, IconPhoto } from '@tabler/icons-react';
import { Button, Input } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const DirectMailInsertTools = () => {
  const { sending, failedDelivery } = useDirectMailComposerContext();
  const disabled = sending || Boolean(failedDelivery);
  const { fileInput, attachmentInput, uploadAttachment, uploadImage } =
    useDirectMailInsertTools();
  const { t } = useTranslation('frontline');
  return (
    <>
      <DirectMailTemplateSelector />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7 rounded-sm"
        title={t('attach-files')}
        aria-label={t('attach-files')}
        disabled={disabled}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => attachmentInput.current?.click()}
      >
        <IconPaperclip className="size-4" />
      </Button>
      <Input
        ref={attachmentInput}
        type="file"
        className="hidden"
        aria-label={t('upload-attachment')}
        disabled={disabled}
        onChange={uploadAttachment}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7 rounded-sm"
        title={t('insert-image')}
        aria-label={t('insert-image')}
        disabled={disabled}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => fileInput.current?.click()}
      >
        <IconPhoto className="size-4" />
      </Button>
      <Input
        ref={fileInput}
        type="file"
        accept="image/*"
        className="hidden"
        aria-label={t('upload-image')}
        disabled={disabled}
        onChange={uploadImage}
      />
    </>
  );
};
