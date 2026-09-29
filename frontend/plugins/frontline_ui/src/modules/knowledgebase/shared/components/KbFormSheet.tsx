import { Button, cn, ScrollArea, Sheet } from 'erxes-ui';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export const KbFormSheet = ({
  isOpen,
  onClose,
  title,
  submitLabel,
  loading,
  onSubmit,
  className,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  submitLabel: string;
  loading: boolean;
  onSubmit: () => void;
  className?: string;
  children: ReactNode;
}) => {
  const { t } = useTranslation('frontline');

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
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {t('cancel', 'Cancel')}
          </Button>
          <Button type="submit" onClick={onSubmit} disabled={loading}>
            {loading ? t('saving', 'Saving…') : submitLabel}
          </Button>
        </Sheet.Footer>
      </Sheet.View>
    </Sheet>
  );
};
