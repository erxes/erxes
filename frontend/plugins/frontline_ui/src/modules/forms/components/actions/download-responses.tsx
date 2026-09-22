import { IconDownload } from '@tabler/icons-react';
import { DropdownMenu, Sheet } from 'erxes-ui';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActiveExports,
  Can,
  ExportFieldSelection,
  useExport,
} from 'ui-modules';

const FORM_SUBMISSION_ENTITY_TYPE = 'frontline:formSubmission.formSubmission';

type DownloadResponsesActionProps = {
  formId: string;
  formName: string;
  children: (action: ReactNode) => ReactNode;
};

const DownloadResponsesSheet = ({
  open,
  onOpenChange,
  entityDisplayName,
  onStartExport,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityDisplayName: string;
  onStartExport: () => void;
}) => {
  const { t } = useTranslation('frontline');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <Sheet.View>
        <Sheet.Header>
          <Sheet.Title>
            {t('download-responses', {
              defaultValue: 'Download responses',
            })}
          </Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="p-5 overflow-y-auto">
          <ActiveExports
            entityType={FORM_SUBMISSION_ENTITY_TYPE}
            entityDisplayName={entityDisplayName}
            onStartExport={onStartExport}
          />
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};

export const DownloadResponsesAction = ({
  formId,
  formName,
  children,
}: DownloadResponsesActionProps) => {
  const { t } = useTranslation('frontline');
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
      <DownloadResponsesSheet
        open={progressOpen}
        onOpenChange={setProgressOpen}
        entityDisplayName={entityDisplayName}
        onStartExport={() => setFieldSelectionOpen(true)}
      />
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
