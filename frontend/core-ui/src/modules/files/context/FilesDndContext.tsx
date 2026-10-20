import { createContext, ReactNode, useContext } from 'react';

type TFilesDndState = {
  // Folders being dragged: they and everything under them can't be drop targets.
  movingFolderIds: string[];
};

const FilesDndStateContext = createContext<TFilesDndState>({
  movingFolderIds: [],
});

export const FilesDndStateProvider = ({
  value,
  children,
}: {
  value: TFilesDndState;
  children: ReactNode;
}) => (
  <FilesDndStateContext.Provider value={value}>
    {children}
  </FilesDndStateContext.Provider>
);

export const useFilesDndState = () => useContext(FilesDndStateContext);
