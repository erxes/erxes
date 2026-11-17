import { UploadDropzone } from '@/automations/components/settings/components/agents/components/DropFilesZone';
import {
  AI_AGENT_UI_LIMITS,
  useAiAgentContextFilesForm,
  withoutFile,
  withUploadedFiles,
} from '@/automations/components/settings/components/agents/hooks/useAiAgentContextFilesForm';
import { Form } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const AiAgentContextFilesForm = () => {
  const { t } = useTranslation('automations');
  const { control, limitsText, reindexingFileId, reindexFile, openFile } =
    useAiAgentContextFilesForm();

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          {t('settings-context-files-attach')}
        </p>
        <p className="text-xs text-muted-foreground">{limitsText}</p>
      </div>

      <Form.Field
        control={control}
        name="context.files"
        render={({ field: { value: files = [], onChange } }) => (
          <Form.Item>
            <Form.Control>
              <UploadDropzone
                files={files}
                maxFiles={AI_AGENT_UI_LIMITS.maxFiles}
                maxSingleFileBytes={AI_AGENT_UI_LIMITS.maxSingleFileBytes}
                maxTotalContextBytes={AI_AGENT_UI_LIMITS.maxTotalContextBytes}
                onFilesUploaded={(uploaded) =>
                  onChange(withUploadedFiles(files, uploaded))
                }
                onFileDelete={(fileId) => onChange(withoutFile(files, fileId))}
                onFileClick={openFile}
                onFileReindex={reindexFile}
                reindexingFileId={reindexingFileId}
              />
            </Form.Control>
            <Form.Description>
              {t('settings-context-files-keep-focused')}
            </Form.Description>
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  );
};
