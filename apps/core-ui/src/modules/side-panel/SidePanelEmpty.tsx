import { IconLayoutSidebarRight } from '@tabler/icons-react';
import { Empty } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
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
