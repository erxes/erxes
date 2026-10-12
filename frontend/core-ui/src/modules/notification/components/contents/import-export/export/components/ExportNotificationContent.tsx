import { TNotification } from 'ui-modules';
import { ImportExportNotificationView } from '@/notification/components/contents/import-export/ImportExportNotificationView';
import { useExportNotificationData } from '../hooks/useExportNotificationData';

export const ExportNotificationContent = ({
  createdAt,
  metadata,
  message,
}: TNotification) => {
  const data = useExportNotificationData(metadata);

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
      successLabelKey="exported"
      errorFallbackKey="export-error-fallback"
      canDownload={data.canDownload}
      downloadUrl={data.fileUrl}
      downloadLabelKey="download-file"
    />
  );
};
