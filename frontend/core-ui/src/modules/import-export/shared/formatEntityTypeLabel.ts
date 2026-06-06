type ImportExportContentType = {
  contentType: string;
  label: string;
};

export const formatImportExportEntityTypeLabel = (
  entityType: string,
  contentTypes: ImportExportContentType[] = [],
) => {
  if (entityType === 'all') {
    return 'All types';
  }

  const configuredLabel = contentTypes.find(
    (contentType) => contentType.contentType === entityType,
  )?.label;

  if (configuredLabel) {
    return configuredLabel;
  }

  const entityName =
    entityType.split('.').pop() || entityType.split(':').pop() || 'record';

  return entityName
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
