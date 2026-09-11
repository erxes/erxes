import type { ChangeEvent, DragEvent, ReactNode } from 'react';
import { createContext, useContext, useId } from 'react';
import { useTranslation } from 'react-i18next';
import { useImportCompletionEffect } from '../../hooks/import/useImportCompletionEffect';
import { useImportUploadHandler } from '../../hooks/import/useImportUploadHandler';
import type {
  TImportProgress,
  TPendingImportUpload,
} from '../../types/import/importTypes';
import { useEntityLabel } from '../../hooks/useEntityLabel';

interface ImportContextType {
  activeImports: TImportProgress[];
  pendingUpload: TPendingImportUpload | null;
  clearPendingUpload: () => void;
  isDragOver: boolean;
  handleDragOver: (e: DragEvent) => void;
  handleDragLeave: (e: DragEvent) => void;
  handleDrop: (e: DragEvent) => void;
  handleFileSelect: (e: ChangeEvent<HTMLInputElement>) => void;
  handleClickUpload: (inputId?: string) => void;
  handleDownloadTemplate: () => void;
  isLoading: boolean;
  inputId: string;
  entityLabel: string;
  entityPluralLabel: string;
  resolvedTitle: string;
  contentType: string;
}

const ImportContext = createContext<ImportContextType | null>(null);

export const ImportProvider = ({
  children,
  pluginName,
  moduleName,
  collectionName,
  title,
  onFileUploaded,
}: {
  children: ReactNode;
  pluginName: string;
  moduleName: string;
  collectionName: string;
  title: string;
  onFileUploaded?: (file: File) => void;
}) => {
  const { t } = useTranslation('importExport');
  const inputId = useId();
  const contentType = `${pluginName}:${moduleName}.${collectionName}`;
  const entityLabel = useEntityLabel(collectionName);
  const entityPluralLabel = useEntityLabel(collectionName, { plural: true });
  const entityTitleLabel = useEntityLabel(collectionName, {
    plural: true,
    capitalize: true,
  });

  const resolvedTitle =
    title === 'Upload CSV'
      ? t('import-entity', { entity: entityTitleLabel })
      : title;
  const {
    activeImports,
    pendingUpload,
    clearPendingUpload,
    isDragOver,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
    handleClickUpload,
    handleDownloadTemplate,
    isLoading,
  } = useImportUploadHandler(contentType, onFileUploaded);

  useImportCompletionEffect(activeImports);

  return (
    <ImportContext.Provider
      value={{
        activeImports,
        pendingUpload,
        clearPendingUpload,
        isDragOver,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        handleFileSelect,
        handleClickUpload,
        handleDownloadTemplate,
        isLoading,
        inputId,
        entityLabel,
        entityPluralLabel,
        resolvedTitle,
        contentType,
      }}
    >
      {children}
    </ImportContext.Provider>
  );
};

export const useImport = () => {
  const ctx = useContext(ImportContext);
  if (!ctx) throw new Error('useImport must be used within ImportProvider');
  return ctx;
};
