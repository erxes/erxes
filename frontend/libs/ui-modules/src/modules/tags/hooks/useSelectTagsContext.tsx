import { useContext } from 'react';
import { SelectTagsContext } from '../contexts/SelectTagsContext';
import { ISelectTagsContext } from '../types/Tag';

export const useSelectTagsContext = () => {
  const context = useContext(SelectTagsContext);

  return context || ({} as ISelectTagsContext);
};
