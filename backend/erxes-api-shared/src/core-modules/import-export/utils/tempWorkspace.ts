import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

type TempWorkspaceKind = 'import' | 'export';

export interface ImportExportTempWorkspace {
  dirPath: string;
  createFilePath(fileName: string): string;
  cleanup(): Promise<void>;
}

export const createImportExportTempWorkspace = async ({
  kind,
}: {
  kind: TempWorkspaceKind;
}): Promise<ImportExportTempWorkspace> => {
  const dirPath = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), `erxes-${kind}-`),
  );

  return {
    dirPath,
    createFilePath(fileName: string) {
      return path.join(dirPath, fileName);
    },
    async cleanup() {
      await fs.promises.rm(dirPath, {
        recursive: true,
        force: true,
      });
    },
  };
};
