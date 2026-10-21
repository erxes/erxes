import { DirectMailTemplateSelector } from '@/integrations/mail/composer/components/toolbar/DirectMailTemplateSelector';
import { useDirectMailComposerContext } from '@/integrations/mail/composer/hooks/useDirectMailComposerFields';
import { useDirectMailInsertTools } from '@/integrations/mail/composer/hooks/useDirectMailInsertTools';
import { IconPaperclip, IconPhoto } from '@tabler/icons-react';
import { Button, Input } from 'erxes-ui';

export const DirectMailInsertTools = () => {
  const { sending, failedDelivery } = useDirectMailComposerContext();
  const disabled = sending || Boolean(failedDelivery);
  const { fileInput, attachmentInput, uploadAttachment, uploadImage } =
    useDirectMailInsertTools();
  return (
    <>
      <DirectMailTemplateSelector />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7 rounded-sm"
        title="Attach files"
        aria-label="Attach files"
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
        aria-label="Upload attachment"
        disabled={disabled}
        onChange={uploadAttachment}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7 rounded-sm"
        title="Insert image"
        aria-label="Insert image"
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
        aria-label="Upload image"
        disabled={disabled}
        onChange={uploadImage}
      />
    </>
  );
};
