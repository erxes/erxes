import { useDirectMailComposerContext } from '@/integrations/mail/composer/hooks/useDirectMailComposerFields';
import { Button } from 'erxes-ui';
export const ComposerAttachments = () => {
  const { attachments, setAttachments, sending, failedDelivery } =
    useDirectMailComposerContext();
  const disabled = sending || Boolean(failedDelivery);
  const onRemove = (id: string) =>
    setAttachments((items) => items.filter((item) => item.id !== id));
  if (!attachments.length) return null;

  return (
    <ul className="flex flex-none flex-wrap gap-2 px-4 py-2 text-sm">
      {attachments.map((attachment) => (
        <li
          key={attachment.id}
          className="flex items-center gap-1 rounded bg-muted px-2"
        >
          <span className="max-w-48 truncate">{attachment.name}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={`Remove ${attachment.name}`}
            disabled={disabled}
            onClick={() => onRemove(attachment.id)}
          >
            ×
          </Button>
        </li>
      ))}
    </ul>
  );
};
