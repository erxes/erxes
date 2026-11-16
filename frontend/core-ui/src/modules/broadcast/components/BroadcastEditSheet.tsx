import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import { PagePanelContext } from '@/side-panel/hooks/usePagePanel';
import { SidePanelRecordPathContext } from 'ui-modules';
import { BroadcastSteps } from '@/broadcast/components/steps/BroadcastSteps';
import { BroadcastStepsSheetView } from '@/broadcast/components/steps/BroadcastStepsSheetView';
import { useTranslation } from 'react-i18next';
import { BroadcastErrorState } from '@/broadcast/components/list/BroadcastStates';
import type { IBroadcastFormData } from '@/broadcast/hooks/useBroadcastForm';
import {
  useBroadcastEditSheet,
  useBroadcastEditSheetContent,
} from '@/broadcast/hooks/useBroadcastEditSheet';

/**
 * A campaign is edited through the sheet it was created in.
 *
 * Its name, its recipients and its content are one decision, so opening only
 * the flow — or only the copy — would leave the rest unreachable. Live
 * campaigns never get here: what they are sending is already out.
 */
export const BroadcastEditSheet = ({ page = false }: { page?: boolean }) => {
  const { editMessageId, method, pagePanel, handleClose, onExpand } =
    useBroadcastEditSheet(page);

  return (
    <PagePanelContext.Provider value={pagePanel}>
      <SidePanelRecordPathContext.Provider value={pagePanel.path}>
        <BroadcastStepsSheetView method={method}>
          {editMessageId && (
            <BroadcastEditSheetContent
              messageId={editMessageId}
              onClose={handleClose}
              onExpand={onExpand}
            />
          )}
        </BroadcastStepsSheetView>
      </SidePanelRecordPathContext.Provider>
    </PagePanelContext.Provider>
  );
};

const BroadcastEditSheetContent = ({
  messageId,
  onClose,
  onExpand,
}: {
  messageId: string;
  onClose: () => void;
  onExpand?: (values: IBroadcastFormData, step: number) => void;
}) => {
  const { t } = useTranslation('broadcasts');
  const {
    entry,
    error,
    retry,
    notFound,
    flowFailed,
    loading,
    initialValues,
    initialStep,
  } = useBroadcastEditSheetContent(messageId);

  if (error) {
    return (
      <PagePanelStatus
        entry={entry}
        error
        errorState={<BroadcastErrorState error={error} onRetry={retry} />}
      />
    );
  }

  if (notFound) {
    return (
      <PagePanelStatus
        entry={entry}
        notFoundState={
          <BroadcastErrorState error={new Error(t('error.not-found'))} />
        }
      />
    );
  }

  if (flowFailed) {
    return <PagePanelStatus entry={entry} error />;
  }

  if (loading) {
    return <PagePanelStatus entry={entry} loading />;
  }

  return (
    <BroadcastSteps
      messageId={messageId}
      initialValues={initialValues}
      onClose={onClose}
      onExpand={onExpand}
      initialStep={initialStep}
    />
  );
};
