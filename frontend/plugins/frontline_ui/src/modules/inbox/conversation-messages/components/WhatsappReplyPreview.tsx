import { IconCornerUpLeft } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { IMessage } from '@/inbox/types/Conversation';

/**
 * The small quoted-message strip WhatsApp itself shows above a reply.
 *
 * Clicking it scrolls to and briefly highlights the quoted message — the same
 * affordance WhatsApp's own clients give, and the only way an agent can
 * actually see what a reply was answering without it: `content` alone
 * ("yes that works") is meaningless without knowing which of possibly many
 * earlier messages it was replying to.
 */
export const WhatsappReplyPreview = ({
  whatsappReplyTo,
}: {
  whatsappReplyTo: IMessage['whatsappReplyTo'];
}) => {
  const { t } = useTranslation('frontline');

  if (!whatsappReplyTo?._id) {
    return null;
  }

  const scrollToQuoted = () => {
    const target = document.getElementById(`message-${whatsappReplyTo._id}`);

    if (!target) {
      return;
    }

    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    target.classList.add('animate-highlight-flash');
    // Matches the animation's own duration — see the Tailwind config entry
    // this class is defined against. Removed afterwards so scrolling to the
    // SAME message a second time can flash it again; a class left in place
    // permanently would only ever play once.
    setTimeout(() => target.classList.remove('animate-highlight-flash'), 1500);
  };

  return (
    <button
      type="button"
      onClick={scrollToQuoted}
      className="flex items-start gap-1.5 rounded-md bg-muted px-2 py-1.5 mb-1.5 text-left text-xs text-muted-foreground border-l-2 border-primary/50 w-full hover:bg-accent transition-colors"
    >
      <IconCornerUpLeft className="size-3 mt-0.5 shrink-0" />
      <span className="truncate">
        {whatsappReplyTo.content || t('whatsapp-reply-preview-no-text')}
      </span>
    </button>
  );
};
