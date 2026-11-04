import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ScrollArea, Spinner } from 'erxes-ui';
import { ActivityLogs } from 'ui-modules';

export const ContentPanelBody = ({ children }: { children: ReactNode }) => (
  <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
    <div className="flex flex-col gap-4 p-4">{children}</div>
  </ScrollArea>
);

export const ContentPanelFooter = ({
  onCancel,
  submitLabel,
  saving,
  disabled,
}: {
  onCancel: () => void;
  submitLabel: string;
  saving?: boolean;
  disabled?: boolean;
}) => {
  const { t } = useTranslation('content');

  return (
    <div className="flex shrink-0 justify-end gap-1 border-t bg-background p-2">
      <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
        {t('cancel')}
      </Button>
      <Button type="submit" size="sm" disabled={saving || disabled}>
        {saving && <Spinner size="sm" />}
        {submitLabel}
      </Button>
    </div>
  );
};

export const ContentPanelRecordState = ({
  loading,
  hasRecord,
  children,
}: {
  loading: boolean;
  hasRecord: boolean;
  children?: ReactNode;
}) => {
  if (loading && !hasRecord) {
    return <Spinner containerClassName="py-12" />;
  }

  if (!hasRecord) {
    return null;
  }

  return children ?? null;
};

export const ContentPanelActivity = ({ contentId }: { contentId: string }) => (
  <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
    <div className="pt-3 [&_.px-6]:px-2">
      <ActivityLogs targetId={contentId} showInternalNotes={false} />
    </div>
  </ScrollArea>
);
