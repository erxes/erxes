import { createContext, useContext, useMemo, useState } from 'react';

type TagDraftKind = 'group' | 'standalone' | 'child';

export type TagDraftState = {
  _id: string;
  kind: TagDraftKind;
  parentId?: string;
  colorCode: string;
  name: string;
  description: string;
  savedId?: string;
};

type TagsContextValue = {
  draft: TagDraftState | null;
  openDraft: (
    draft: Omit<TagDraftState, '_id' | 'name' | 'description' | 'savedId'>,
  ) => void;
  closeDraft: () => void;
  updateDraft: (patch: Partial<Omit<TagDraftState, '_id'>>) => void;
};

const TagsContext = createContext<TagsContextValue | null>(null);

export const TagsProvider = ({ children }: { children: React.ReactNode }) => {
  const [draft, setDraft] = useState<TagDraftState | null>(null);

  const value = useMemo<TagsContextValue>(
    () => ({
      draft,
      openDraft: (nextDraft) => {
        setDraft({
          _id: 'draft-tag-row',
          name: '',
          description: '',
          ...nextDraft,
        });
      },
      closeDraft: () => setDraft(null),
      updateDraft: (patch) =>
        setDraft((current) => (current ? { ...current, ...patch } : current)),
    }),
    [draft],
  );

  return <TagsContext.Provider value={value}>{children}</TagsContext.Provider>;
};

export const useTagsContext = () => {
  const context = useContext(TagsContext);

  if (!context) {
    throw new Error('useTagsContext must be used within TagsProvider');
  }

  return context;
};
