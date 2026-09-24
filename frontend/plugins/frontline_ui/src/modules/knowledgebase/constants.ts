import { ITopicFormData, TTopicTab } from '@/knowledgebase/types';

export {
  ICONS,
  REACTIONS,
  LANGUAGES,
} from '../../../../content_ui/src/modules/shared/constants';

export const TOPIC_FIELD_TAB: Record<keyof ITopicFormData, TTopicTab> = {
  title: 'general',
  description: 'general',
  color: 'appearance',
  backgroundImage: 'appearance',
};
