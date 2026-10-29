import { ComponentType, ReactNode } from 'react';
import { FieldValues, UseFormReturn } from 'react-hook-form';
import { Form, ScrollArea, Spinner } from 'erxes-ui';
import { ActivityLogs, PanelFormLayout } from 'ui-modules';

export interface ISettingsPanelViewProps {
  contentType: string;
  contentId: string;
}

export interface ISettingsPanelViews {
  addLabel: string;
  editLabel: string;
  New: ComponentType<ISettingsPanelViewProps>;
  Detail: ComponentType<ISettingsPanelViewProps>;
  Actions?: ComponentType<ISettingsPanelViewProps>;
}

export const SettingsPanelDraftForm = <T extends FieldValues>({
  form,
  onSubmit,
  onCancel,
  saving,
  saveLabel,
  children,
}: {
  form: UseFormReturn<T>;
  onSubmit: (data: T) => void;
  onCancel: () => void;
  saving: boolean;
  saveLabel?: string;
  children: ReactNode;
}) => (
  <Form {...form}>
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-1 min-h-0 flex-col"
    >
      <PanelFormLayout
        onCancel={onCancel}
        saving={saving}
        saveLabel={saveLabel}
      >
        {children}
      </PanelFormLayout>
    </form>
  </Form>
);

export const SettingsPanelDetailLayout = ({
  loading,
  hasRecord,
  children,
}: {
  loading: boolean;
  hasRecord: boolean;
  children: ReactNode;
}) => {
  if (loading && !hasRecord) {
    return <Spinner containerClassName="py-12" />;
  }

  if (!hasRecord) {
    return null;
  }

  return (
    <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
      <div className="flex flex-col gap-0.5 p-3">{children}</div>
    </ScrollArea>
  );
};

export const SettingsPanelActivity = ({ contentId }: { contentId: string }) => (
  <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
    <div className="pt-3 [&_.px-6]:px-2">
      <ActivityLogs targetId={contentId} showInternalNotes={false} />
    </div>
  </ScrollArea>
);
