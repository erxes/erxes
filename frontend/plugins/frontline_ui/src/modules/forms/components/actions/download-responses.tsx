import { IconDownload } from '@tabler/icons-react';
import { DropdownMenu } from 'erxes-ui';
import { SettingsLocalPanel } from '@/settings/components/SettingsLocalPanel';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActiveExports,
  Can,
  ExportFieldSelection,
  RecordSidePanel,
  useExport,
  usePanelExpanded,
} from 'ui-modules';

const FORM_SUBMISSION_ENTITY_TYPE = 'frontline:formSubmission.formSubmission';

type DownloadResponsesActionProps = {
  formId: string;
  formName: string;
  children: (action: ReactNode) => ReactNode;
};

const DownloadResponsesSheet = ({
  onOpenChange,
  entityDisplayName,
  onStartExport,
}: {
  onOpenChange: (open: boolean) => void;
  entityDisplayName: string;
  onStartExport: () => void;
}) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.forms' });
  const expanded = usePanelExpanded();

  return (
    <>
      <RecordSidePanel.Header
        title={t('download-responses', {
          defaultValue: 'Download responses',
        })}
        onClose={expanded ? undefined : () => onOpenChange(false)}
      />
      <div className="min-h-0 flex-1 p-5 overflow-y-auto">
        <ActiveExports
          entityType={FORM_SUBMISSION_ENTITY_TYPE}
          entityDisplayName={entityDisplayName}
          onStartExport={onStartExport}
        />
      </div>
    </>
  );
};

export const DownloadResponsesAction = ({
  formId,
  formName,
  children,
}: DownloadResponsesActionProps) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.forms' });
  const [progressOpen, setProgressOpen] = useState(false);
  const [fieldSelectionOpen, setFieldSelectionOpen] = useState(false);
  const filters = { formId };
  const entityDisplayName = t('form-responses-export-label', {
    defaultValue: '{{formName}} responses',
    formName,
  });
  const { onFieldSelectionConfirm } = useExport({
    entityType: FORM_SUBMISSION_ENTITY_TYPE,
    getFilters: () => filters,
    confirmMessage: t('confirm-form-responses-export', {
      defaultValue:
        'Create a CSV export of the responses submitted to "{{formName}}"?',
      formName,
    }),
  });

  const action = (
    <Can action="formSubmissionsExportManage">
      <DropdownMenu.Item onSelect={() => setProgressOpen(true)}>
        <IconDownload />
        {t('download-responses', {
          defaultValue: 'Download responses',
        })}
      </DropdownMenu.Item>
    </Can>
  );

  return (
    <>
      {children(action)}
      <SettingsLocalPanel open={progressOpen} onOpenChange={setProgressOpen}>
        <DownloadResponsesSheet
          onOpenChange={setProgressOpen}
          entityDisplayName={entityDisplayName}
          onStartExport={() => setFieldSelectionOpen(true)}
        />
      </SettingsLocalPanel>
      <ExportFieldSelection
        entityType={FORM_SUBMISSION_ENTITY_TYPE}
        open={fieldSelectionOpen}
        onOpenChange={setFieldSelectionOpen}
        onConfirm={onFieldSelectionConfirm}
        entityDisplayName={entityDisplayName}
        filters={filters}
      />
    </>
  );
};
