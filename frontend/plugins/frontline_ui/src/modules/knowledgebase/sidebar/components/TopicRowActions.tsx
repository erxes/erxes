import {
  IconFolderPlus,
  IconFolders,
  IconSettings,
  IconPencil,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  KB_RECORD_CONTENT_TYPES,
  KNOWLEDGE_BASE_PATH,
} from '@/knowledgebase/constants';
import { useSidePanel } from 'ui-modules';
import { KbSidebarRowActions } from '@/knowledgebase/sidebar/components/KbSidebarRowActions';
import { ITopic } from '@/knowledgebase/types';

export const TopicRowActions = ({
  topic,
  onAddCategory,
}: {
  topic: ITopic;
  onAddCategory: () => void;
}) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.knowledgebase',
  });
  const navigate = useNavigate();
  const { openRecord } = useSidePanel();
  const topicPath = `${KNOWLEDGE_BASE_PATH}/${topic._id}`;

  return (
    <KbSidebarRowActions
      label={t('kb-topic-actions', 'Topic actions')}
      actions={[
        {
          value: 'edit',
          icon: IconPencil,
          label: t('kb-edit-topic', 'Edit Topic'),
          onClick: () =>
            openRecord({
              contentType: KB_RECORD_CONTENT_TYPES.topic,
              contentId: topic._id,
            }),
        },
        {
          value: 'add-category',
          icon: IconFolderPlus,
          label: t('kb-new-category', 'New Category'),
          onClick: onAddCategory,
        },
        {
          value: 'categories',
          icon: IconFolders,
          label: t('kb-manage-categories', 'Manage categories'),
          onClick: () => navigate(`${topicPath}/categories`),
        },
        {
          value: 'settings',
          icon: IconSettings,
          label: t('settings', 'Settings'),
          onClick: () => navigate(`${topicPath}/kbsettings`),
        },
      ]}
    />
  );
};
