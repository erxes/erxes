import { IconHelpCircle } from '@tabler/icons-react';
import { Button, Dialog, ScrollArea } from 'erxes-ui';
import type { ChangeEvent, DragEvent, ReactNode } from 'react';
import { createContext, useContext, useId } from 'react';
import { useImportUploadHandler } from '../../hooks/import/useImportUploadHandler';
import type { TImportProgress } from '../../types/import/importTypes';
import { formatEntityLabel } from '../../utils/entityLabel';

interface ImportContextType {
  activeImports: TImportProgress[];
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
  const inputId = useId();
  const contentType = `${pluginName}:${moduleName}.${collectionName}`;
  const entityLabel = formatEntityLabel(collectionName);
  const entityPluralLabel = formatEntityLabel(collectionName, { plural: true });
  const resolvedTitle =
    title === 'Upload CSV'
      ? `Import ${formatEntityLabel(collectionName, {
          plural: true,
          capitalize: true,
        })}`
      : title;
  const {
    activeImports,
    isDragOver,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
    handleClickUpload,
    handleDownloadTemplate,
    isLoading,
  } = useImportUploadHandler(contentType, onFileUploaded);

  return (
    <ImportContext.Provider
      value={{
        activeImports,
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
