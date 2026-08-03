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

export const DownloadResponsesAction = ({
  formId,
  formName,
  children,
}: DownloadResponsesActionProps) => {
  const { t } = useTranslation('frontline');
  const [progressOpen, setProgressOpen] = useState(false);
  const [fieldSelectionOpen, setFieldSelectionOpen] = useState(false);
  const filters = { formId };
  const entityDisplayName = `${formName} responses`;
  const { onFieldSelectionConfirm } = useExport({
    entityType: FORM_SUBMISSION_ENTITY_TYPE,
    getFilters: () => filters,
    confirmMessage: `Create a CSV export of the responses submitted to "${formName}"?`,
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
      <Sheet open={progressOpen} onOpenChange={setProgressOpen}>
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
              onStartExport={() => setFieldSelectionOpen(true)}
            />
          </Sheet.Content>
        </Sheet.View>
      </Sheet>
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
