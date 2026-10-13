import { useQueryState } from 'erxes-ui';
import { useLocation, useParams } from 'react-router-dom';
import { TKnowledgeBaseSection } from '@/knowledgebase/types';

const SECTIONS: TKnowledgeBaseSection[] = [
  'articles',
  'categories',
  'kbsettings',
];

export const useKnowledgeBaseRoute = () => {
  const { topicId } = useParams();
  const { pathname } = useLocation();
  const [categoryId] = useQueryState<string>('categoryId');

  const lastSegment = pathname.split('/').pop();
  const section = SECTIONS.find((item) => item === lastSegment);

  return {
    topicId,
    section,
    categoryId: section === 'articles' ? categoryId : null,
  };
};
