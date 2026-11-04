import { useDirectMailComposerContext } from '@/integrations/mail/composer/hooks/useDirectMailComposerFields';
import {
  IconArrowsMaximize,
  IconArrowsMinimize,
  IconMinus,
  IconX,
} from '@tabler/icons-react';
import { Button, Sheet } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const ComposerHeader = () => {
  const {
    close: onClose,
    setMinimized,
    setExpanded,
    minimized,
    expanded,
    sending: loading,
  } = useDirectMailComposerContext();
  const { t } = useTranslation('frontline');
  const onMinimize = () => setMinimized((value) => !value);
  const onExpand = () => {
    setMinimized(false);
    setExpanded((value) => !value);
  };
  return (
    <Sheet.Header
      className="flex h-9 flex-none items-center justify-between bg-muted px-4 text-foreground"
      onDoubleClick={(event) => {
        if (
          !(event.target instanceof Element) ||
          !event.target.closest('button')
        )
          onExpand();
      }}
    >
      {minimized ? (
        <Button
          type="button"
          variant="ghost"
          className="h-8 p-0 text-sm font-medium hover:bg-transparent"
          onClick={onMinimize}
        >
          {t('new-message')}
        </Button>
      ) : (
        <span className="text-sm font-medium">{t('new-message')}</span>
      )}
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-6"
          aria-label={
            minimized
              ? t('restore-email-composer')
              : t('minimize-email-composer')
          }
          onClick={onMinimize}
        >
          <IconMinus className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-6"
          aria-label={expanded ? t('exit-full-screen') : t('full-screen')}
          onClick={onExpand}
        >
          {expanded ? (
            <IconArrowsMinimize className="size-4" />
          ) : (
            <IconArrowsMaximize className="size-4" />
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-6"
          aria-label={t('close-email-composer')}
          onClick={onClose}
          disabled={loading}
        >
          <IconX className="size-4" />
        </Button>
      </div>
    </Sheet.Header>
  );
};
