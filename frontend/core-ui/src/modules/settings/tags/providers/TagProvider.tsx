import { createContext, useContext, useState } from 'react';

interface ITagContext {
  mode: 'idle' | 'adding-tag' | 'adding-group' | 'adding-tag-to-group';
  targetGroupId: string | null;
  setMode: (mode: ITagContext['mode']) => void;
  startAddingTag: () => void;
  startAddingGroup: () => void;
  startAddingTagToGroup: (groupId: string) => void;
  cancel: () => void;
}

export const TagContext = createContext<ITagContext>({} as ITagContext);

export const TagProvider = ({children}: {children: React.ReactNode}) => {
  const [mode, setMode] = useState<ITagContext['mode']>('idle');
  const [targetGroupId, setTargetGroupId] = useState<string | null>(null);
  
  const startAddingTag = () => setMode('adding-tag');
  const startAddingGroup = () => setMode('adding-group');
  const startAddingTagToGroup = (groupId: string) => {
    setTargetGroupId(groupId);
    setMode('adding-tag-to-group');
  };
  const cancel = () => {
    setMode('idle');
    setTargetGroupId(null);
  };

  return (
    <TagContext.Provider value={{ 
      mode, 
      targetGroupId,
      setMode,
      startAddingTag,
      startAddingGroup,
      startAddingTagToGroup,
      cancel
    }}>
      {children}
    </TagContext.Provider>
  )
};

export const useTagContext = () => {
  return useContext(TagContext);
};

