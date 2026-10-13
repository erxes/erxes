import { TNotification } from 'ui-modules';
import { ImportExportNotificationView } from '@/notification/components/contents/import-export/ImportExportNotificationView';
import { useImportNotificationData } from '../hooks/useImportNotificationData';

export const ImportNotificationContent = ({
  createdAt,
  metadata,
  message,
}: TNotification) => {
  const data = useImportNotificationData(metadata);

  return (
    <ImportExportNotificationView
      createdAt={createdAt}
      message={message}
      fileName={data.fileName}
      status={data.status}
      errorMessage={data.errorMessage}
      successRows={data.successRows}
      errorRows={data.errorRows}
      totalRows={data.totalRows}
      successLabelKey="imported"
      errorFallbackKey="import-error-fallback"
      canDownload={data.canDownloadErrorFile}
      downloadUrl={data.errorFileDownloadUrl}
      downloadLabelKey="download-error-file"
    />
  );
};
