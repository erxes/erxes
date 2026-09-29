import { articlesTotalCountAtom } from '@/knowledgebase/articles/states/articlesTotalCountState';
import { KbTotalCount } from '@/knowledgebase/shared/components/KbTotalCount';

export const ArticlesTotalCount = () => (
  <KbTotalCount countAtom={articlesTotalCountAtom} />
);
