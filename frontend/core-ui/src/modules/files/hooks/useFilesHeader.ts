import { filesCanContribute, useFilesUpload } from 'ui-modules';
import { useFilesPage } from '../context/FilesPageContext';

export const useFilesHeader = () => {
  const page = useFilesPage();
  const { upload } = useFilesUpload();
  const { browser } = page;
  const isSearching = !!page.searchValue.trim();

  return {
    space: page.space,
    path: isSearching ? [] : browser.path,
    openFolder: page.openFolder,
    searchValue: page.searchValue,
    setSearchValue: page.setSearchValue,
    canContribute:
      !isSearching &&
      !!browser.folderId &&
      filesCanContribute(browser.currentFolder?.myRole),
    newFolder: () => page.setNameDialog({ mode: 'create-folder' }),
    upload: (files: File[]) => upload(files, browser.folderId),
  };
};
