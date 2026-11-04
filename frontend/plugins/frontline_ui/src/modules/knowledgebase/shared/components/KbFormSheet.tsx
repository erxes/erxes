import { ReactNode } from 'react';
import { PanelFormLayout } from 'ui-modules';
import { KbFormPanelContext } from './KbFormLayout';

/** Wraps panel fields with explicit-save submission and safe keyboard behavior. */
export const KbFormSheet = ({
  onClose,
  submitLabel,
  loading,
  onSubmit,
  children,
}: {
  onClose: () => void;
  submitLabel: string;
  loading: boolean;
  onSubmit: () => void;
  children: ReactNode;
}) => (
  <form
    className="flex flex-1 min-h-0 min-w-0 flex-col"
    onSubmit={(event) => {
      event.preventDefault();
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
        saving={loading}
        saveLabel={submitLabel}
      >
        {children}
      </PanelFormLayout>
    </KbFormPanelContext.Provider>
  </form>
);
