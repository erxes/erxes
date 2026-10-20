import { useQueryState } from 'erxes-ui';
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useMemo,
  useState,
} from 'react';
import { TFilesItem, useFilesSelection } from '../hooks/useFilesSelection';
import { IFile, IFilesFolder, TFilesSpace, useFilesBrowser } from 'ui-modules';

export type TFilesNameDialog =
  | { mode: 'create-folder' }
  | { mode: 'rename-folder'; folder: IFilesFolder }
  | { mode: 'rename-file'; file: IFile };

export type TFilesAccessTarget = { itemType: 'folder' | 'file'; _id: string };

export type TFilesMoveTarget = {
  fileIds: string[];
  folderIds: string[];
  label: string;
};

type TFilesPageContext = {
  space: TFilesSpace;
  browser: ReturnType<typeof useFilesBrowser>;
  openFolder: (folderId?: string) => void;
  searchValue: string;
  setSearchValue: (value: string) => void;
  nameDialog: TFilesNameDialog | null;
  setNameDialog: (dialog: TFilesNameDialog | null) => void;
  moveTarget: TFilesMoveTarget | null;
  setMoveTarget: (target: TFilesMoveTarget | null) => void;
  previewFile: IFile | null;
  setPreviewFile: Dispatch<SetStateAction<IFile | null>>;
  appearanceFolders: IFilesFolder[];
  setAppearanceFolders: (folders: IFilesFolder[]) => void;
  selection: ReturnType<typeof useFilesSelection>;
  bulkShareOpen: boolean;
  setBulkShareOpen: (open: boolean) => void;
  accessTarget: TFilesAccessTarget | null;
  setAccessTarget: (target: TFilesAccessTarget | null) => void;
};

const FilesPageContext = createContext<TFilesPageContext | null>(null);

export const FilesPageProvider = ({
  space,
  children,
}: {
  space: TFilesSpace;
  children: ReactNode;
}) => {
  const [folderId, setFolderId] = useQueryState<string>('folderId');
  const [searchValue, setSearchValue] = useState('');
  const browser = useFilesBrowser({ space, folderId, searchValue });
  const [nameDialog, setNameDialog] = useState<TFilesNameDialog | null>(null);
  const [moveTarget, setMoveTarget] = useState<TFilesMoveTarget | null>(null);
  const [previewFile, setPreviewFile] = useState<IFile | null>(null);
  const [appearanceFolders, setAppearanceFolders] = useState<IFilesFolder[]>(
    [],
  );
  const [bulkShareOpen, setBulkShareOpen] = useState(false);
  const visible = useMemo<TFilesItem[]>(
    () => [
      ...browser.folders.map((item) => ({ itemType: 'folder' as const, item })),
      ...browser.files.map((item) => ({ itemType: 'file' as const, item })),
    ],
    [browser.folders, browser.files],
  );
  const selection = useFilesSelection(
    visible,
    `${space}:${browser.folderId || 'shared'}:${searchValue}`,
  );
  const [accessTarget, setAccessTarget] = useState<TFilesAccessTarget | null>(
    null,
  );

  const openFolder = (id?: string) => {
    setSearchValue('');
    setFolderId(id || null);
  };

  return (
    <FilesPageContext.Provider
      value={{
        space,
        browser,
        openFolder,
        searchValue,
        setSearchValue,
        nameDialog,
        setNameDialog,
        moveTarget,
        setMoveTarget,
        previewFile,
        setPreviewFile,
        appearanceFolders,
        setAppearanceFolders,
        selection,
        bulkShareOpen,
        setBulkShareOpen,
        accessTarget,
        setAccessTarget,
      }}
    >
      {children}
    </FilesPageContext.Provider>
  );
};

export const useFilesPage = () => {
  const context = useContext(FilesPageContext);

  if (!context) {
    throw new Error('useFilesPage must be used inside FilesPageProvider');
  }

  return context;
};
