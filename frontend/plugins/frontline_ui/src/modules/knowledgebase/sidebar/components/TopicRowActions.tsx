import { IconFolderPlus, IconFolders, IconSettings } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { KNOWLEDGE_BASE_PATH } from '@/knowledgebase/constants';
import { KbSidebarRowActions } from '@/knowledgebase/sidebar/components/KbSidebarRowActions';
import { ITopic } from '@/knowledgebase/types';

export const TopicRowActions = ({
  topic,
  onAddCategory,
}: {
  topic: ITopic;
  onAddCategory: () => void;
}) => {
  const { t } = useTranslation('frontline');
  const navigate = useNavigate();
  const topicPath = `${KNOWLEDGE_BASE_PATH}/${topic._id}`;

  return (
    <KbSidebarRowActions
      label={t('kb-topic-actions', 'Topic actions')}
      actions={[
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
