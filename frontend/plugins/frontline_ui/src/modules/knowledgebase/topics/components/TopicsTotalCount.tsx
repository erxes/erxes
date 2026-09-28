import { KbTotalCount } from '@/knowledgebase/shared/components/KbTotalCount';
import { topicsTotalCountAtom } from '@/knowledgebase/topics/states/topicsTotalCountState';

export const TopicsTotalCount = () => (
  <KbTotalCount countAtom={topicsTotalCountAtom} />
);
