import { IconEyeOff } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

export const UnverifiedAttachmentCover = ({
  onReveal,
}: {
  onReveal: () => void;
}) => {
  const { t } = useTranslation('frontline');

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onReveal();
      }}
      className="absolute inset-0 z-[5] flex flex-col items-center justify-center gap-1 bg-muted/80 p-2 text-center text-xs text-muted-foreground backdrop-blur-xl"
    >
      <IconEyeOff size={18} />
      <span>
        {t('customer-sent-unverified', 'Sent by customer · not reviewed')}
      </span>
      <span className="font-medium text-foreground">
        {t('show-attachment', 'Show')}
      </span>
    </button>
  );
};
