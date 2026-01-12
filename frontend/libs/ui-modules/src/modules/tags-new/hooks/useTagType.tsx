import { useContext, createContext } from 'react';

export const TagTypeContext = createContext<string | null | undefined>(
  undefined,
);

export const TagTypeProvider = ({
  value,
  children,
}: {
  value: string | null;
  children: React.ReactNode;
}) => {
  return (
    <TagTypeContext.Provider value={value}>{children}</TagTypeContext.Provider>
  );
};

export const useTagType = () => {
  const tagType = useContext(TagTypeContext);
  if (tagType === undefined) {
    throw new Error('useTagType must be used within a TagTypeProvider');
  }
  return tagType;
};
