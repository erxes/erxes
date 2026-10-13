import { useCallback, useState } from 'react';
import { TKbCategory, TKbView } from '../types/knowledgeBaseTypes';
import { findArticle } from '../utils/knowledgeBaseUtils';

export const useKbNavigation = (categories: TKbCategory[]) => {
  const [stack, setStack] = useState<TKbView[]>([]);

  const view = stack[stack.length - 1];

  const openCategory = useCallback(
    (id: string) =>
      setStack((current) => [...current, { type: 'category', id }]),
    [],
  );

  const openArticle = useCallback(
    (id: string) =>
      setStack((current) => [...current, { type: 'article', id }]),
    [],
  );

  const back = useCallback(
    () => setStack((current) => current.slice(0, -1)),
    [],
  );

  const category =
    view?.type === 'category'
      ? categories.find((item) => item._id === view.id)
      : undefined;

  const article =
    view?.type === 'article' ? findArticle(categories, view.id) : undefined;

  return {
    canGoBack: !!view,
    category,
    article,
    openCategory,
    openArticle,
    back,
  };
};
