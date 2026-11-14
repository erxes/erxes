import { IconLayoutSidebarRight } from '@tabler/icons-react';
import { Empty } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { isApiError } from '@erxes/core-contract/client';
import { RecordSidePanel } from './RecordSidePanel';

/** Explains empty and failed records without mounting their editors. */
export const SidePanelEmpty = ({
  title,
  description,
  onBack,
  onClose,
}: {
  title: string;
  description: string;
  onBack?: () => void;
  onClose?: () => void;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });

  return (
    <>
      <RecordSidePanel.Header title={t('title', 'Side panel')} onBack={onBack} onClose={onClose} />
      <div className="flex flex-1 items-center justify-center p-6">
        <Empty>
          <Empty.Header>
            <Empty.Media variant="icon">
              <IconLayoutSidebarRight />
            </Empty.Media>
            <Empty.Title>{title}</Empty.Title>
            <Empty.Description>{description}</Empty.Description>
          </Empty.Header>
        </Empty>
      </div>
    </>
  );
};

/** A record that failed to load: gone (404), or anything else. */
export const SidePanelFailed = ({
  error,
  onBack,
  onClose,
}: {
  error: Error | null;
  onBack?: () => void;
  onClose?: () => void;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });

  return isApiError(error, 'NOT_FOUND') ? (
    <SidePanelEmpty
      title={t('not-found-title', 'Nothing here')}
      description={t('record-not-found', 'This record no longer exists.')}
      onBack={onBack}
      onClose={onClose}
    />
  ) : (
    <SidePanelEmpty
      title={t('error', 'Unable to load record')}
      description={t('record-load-error', 'Please close the panel and try again.')}
      onBack={onBack}
      onClose={onClose}
    />
  );
};
