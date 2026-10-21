import { useState } from 'react';
import { IFile, TFilesSpace } from '../types';
import { filesCanContribute } from '../utils/roles';
import { useFilesBrowser } from './useFilesBrowser';
import { useFilesUpload } from './useFilesUpload';

export const useFilePicker = ({
  open,
  multiple,
  accept,
  onSelect,
  onOpenChange,
}: {
  open: boolean;
  multiple?: boolean;
  accept?: (file: IFile) => boolean;
  onSelect: (files: IFile[]) => void;
  onOpenChange: (open: boolean) => void;
}) => {
  const [space, setSpace] = useState<TFilesSpace>('personal');
  const [folderId, setFolderId] = useState<string | undefined>();
  const [searchValue, setSearchValue] = useState('');
  const [selected, setSelected] = useState<IFile[]>([]);
  const browser = useFilesBrowser({
    space,
    folderId,
    searchValue,
    skip: !open,
  });
  const { upload } = useFilesUpload();

  const files = accept ? browser.files.filter(accept) : browser.files;

  const toggle = (file: IFile) => {
    setSelected((current) => {
      if (current.some((f) => f._id === file._id)) {
        return current.filter((f) => f._id !== file._id);
      }

      return multiple ? [...current, file] : [file];
    });
  };

  const openFolder = (id?: string) => {
    setFolderId(id);
    setSearchValue('');
  };

  const changeSpace = (next: TFilesSpace) => {
    setSpace(next);
    openFolder();
  };

  const uploadHere = (list: File[]) =>
    upload(list, browser.folderId, (file) => {
      if (!accept || accept(file)) {
        setSelected((current) => (multiple ? [...current, file] : [file]));
      }
    });

  const close = (next: boolean) => {
    if (!next) {
      setSelected([]);
    }

    onOpenChange(next);
  };

  const confirm = () => {
    onSelect(selected);
    close(false);
  };

  return {
    ...browser,
    files,
    space,
    changeSpace,
    canUpload:
      !!browser.folderId && filesCanContribute(browser.currentFolder?.myRole),
    searchValue,
    setSearchValue,
    selected,
    isSelected: (file: IFile) => selected.some((f) => f._id === file._id),
    toggle,
    openFolder,
    uploadHere,
    close,
    confirm,
  };
};
