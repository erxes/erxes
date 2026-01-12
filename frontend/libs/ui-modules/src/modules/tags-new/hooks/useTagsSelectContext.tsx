import { TagsSelectContextType } from 'ui-modules/modules/tags-new/types/TagsSelect';
import { createContext, useContext } from 'react';

export const TagsSelectContext = createContext<TagsSelectContextType>(
  {} as TagsSelectContextType,
);

export const useTagsSelectContext = () => {
  const context = useContext(TagsSelectContext);

  if (!context) {
    throw new Error(
      'useTagsSelectContext must be used within a TagsSelectProvider',
    );
  }

  return context;
};
