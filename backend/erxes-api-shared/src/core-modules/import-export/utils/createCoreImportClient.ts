import { sendTRPCMessage } from '../../../utils/trpc';

type TerminalImportExportError = {
  code?: string;
  stage?: string;
  retryable?: boolean;
};

export type CoreImportClient = {
  getImport: (subdomain: string, importId: string) => Promise<any>;
  updateImportProgress: (
    subdomain: string,
    importId: string,
    progress: {
      status?: string;
      processedRows?: number;
      successRows?: number;
      errorRows?: number;
      totalRows?: number;
      lastProcessedRow?: number;
      errorMessage?: string;
      errorFileUrl?: string;
      terminalError?: TerminalImportExportError;
    },
  ) => Promise<any>;
  addImportedIds: (
    subdomain: string,
    importId: string,
    recordIds: string[],
  ) => Promise<void>;
  saveErrorFile: (
    subdomain: string,
    params: {
      importId: string;
      headerRow: string[];
      errorRows: any[];
      keyToHeaderMap: Record<string, string>;
    },
  ) => Promise<string | null>;
  getExport: (subdomain: string, exportId: string) => Promise<any>;
  updateExportProgress: (
    subdomain: string,
    exportId: string,
    progress: {
      status?: string;
      processedRows?: number;
      totalRows?: number;
      lastCursor?: string;
      estimatedSecondsRemaining?: number;
      fileKey?: string;
      errorMessage?: string;
      terminalError?: TerminalImportExportError;
    },
  ) => Promise<any>;
  saveExportFile: (
    subdomain: string,
    params: {
      exportId: string;
      fileKey: string;
      fileName: string;
      fileIndex?: number;
    },
  ) => Promise<void>;
};

const callCoreImport = async <T>(
  subdomain: string,
  action: string,
  method: 'query' | 'mutation',
  input: Record<string, any>,
): Promise<T> => {
  return await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'import',
    action,
    method,
    input,
  });
};

const callCoreExport = async <T>(
  subdomain: string,
  action: string,
  method: 'query' | 'mutation',
  input: Record<string, any>,
): Promise<T> => {
  return await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'export',
    action,
    method,
    input,
  });
};

export const createCoreImportClient = (): CoreImportClient => {
  return {
    getImport: async (subdomain, importId) =>
      await callCoreImport(subdomain, 'getImport', 'query', { importId }),
    updateImportProgress: async (subdomain, importId, progress) =>
      await callCoreImport(subdomain, 'updateImportProgress', 'mutation', {
        importId,
        progress,
      }),
    addImportedIds: async (subdomain, importId, recordIds) => {
      await callCoreImport(subdomain, 'addImportedIds', 'mutation', {
        importId,
        recordIds,
      });
    },
    saveErrorFile: async (subdomain, params) =>
      await callCoreImport<string | null>(
        subdomain,
        'saveErrorFile',
        'mutation',
        params,
      ),
    getExport: async (subdomain, exportId) =>
      await callCoreExport(subdomain, 'getExport', 'query', { exportId }),
    updateExportProgress: async (subdomain, exportId, progress) =>
      await callCoreExport(subdomain, 'updateExportProgress', 'mutation', {
        exportId,
        progress,
      }),
    saveExportFile: async (subdomain, params) => {
      await callCoreExport(subdomain, 'saveExportFile', 'mutation', params);
    },
  };
};
