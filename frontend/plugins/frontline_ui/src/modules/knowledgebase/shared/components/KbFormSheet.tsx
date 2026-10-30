import { ReactNode } from 'react';
import { PanelFormLayout } from 'ui-modules';
import { KbFormPanelContext } from './KbFormLayout';

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
