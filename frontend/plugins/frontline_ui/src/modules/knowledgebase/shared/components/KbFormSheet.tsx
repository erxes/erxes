import { Button, cn, ScrollArea, Sheet } from 'erxes-ui';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { KbFormPanelContext } from './KbFormLayout';

export const KbFormSheet = ({
  isOpen,
  onClose,
  title,
  submitLabel,
  loading,
  onSubmit,
  className,
  children,
  panel = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  submitLabel: string;
  loading: boolean;
  onSubmit: () => void;
  className?: string;
  children: ReactNode;
  panel?: boolean;
}) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.knowledgebase',
  });

  const footer = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        disabled={loading}
      >
        {t('cancel', 'Cancel')}
      </Button>
      <Button type="button" onClick={onSubmit} disabled={loading}>
        {loading ? t('saving', 'Saving…') : submitLabel}
      </Button>
    </>
  );

  if (panel) {
    return (
      <KbFormPanelContext.Provider value>
        <div className="flex flex-1 min-h-0 min-w-0 flex-col">
          <ScrollArea
            className="flex-1 min-h-0"
            viewportClassName="[&>div]:block!"
          >
            {children}
          </ScrollArea>
          <div className="flex shrink-0 justify-end gap-1 border-t bg-background p-2">
            {footer}
          </div>
        </div>
      </KbFormPanelContext.Provider>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Sheet.View className={cn('p-0 sm:max-w-xl', className)}>
        <Sheet.Header className="p-2.5 border-b">
          <Sheet.Title>{title}</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>

        <Sheet.Content className="overflow-hidden flex-auto">
          <ScrollArea className="h-full">{children}</ScrollArea>
        </Sheet.Content>

        <Sheet.Footer className="flex gap-1 justify-end p-2.5 border-t shrink-0 bg-background">
          {footer}
        </Sheet.Footer>
      </Sheet.View>
    </Sheet>
  );
};
