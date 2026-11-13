import { ReactNode } from 'react';
import { PanelFormLayout } from 'ui-modules';
import { KbFormPanelContext } from './KbFormLayout';

export const KbFormSheet = ({
  onClose,
  submitLabel,
  loading,
  uploading = false,
  onSubmit,
  children,
}: {
  onClose: () => void;
  submitLabel: string;
  loading: boolean;
  uploading?: boolean;
  onSubmit: () => void;
  children: ReactNode;
}) => (
  <form
    className="flex flex-1 min-h-0 min-w-0 flex-col"
    onSubmit={(event) => {
      event.preventDefault();
      if (loading || uploading) return;
      const nativeEvent = event.nativeEvent;
      if (
        !('submitter' in nativeEvent) ||
        !(nativeEvent.submitter instanceof HTMLElement) ||
        nativeEvent.submitter.getAttribute('type') !== 'submit'
      )
        return;
      onSubmit();
    }}
  >
    <KbFormPanelContext.Provider value>
      <PanelFormLayout
        onCancel={() => !loading && onClose()}
        saving={loading || uploading}
        saveLabel={submitLabel}
      >
        {children}
      </PanelFormLayout>
    </KbFormPanelContext.Provider>
  </form>
);
