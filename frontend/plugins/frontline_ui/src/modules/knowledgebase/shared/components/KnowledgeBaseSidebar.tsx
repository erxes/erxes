import { IconFileText, IconFolders, IconSettings } from '@tabler/icons-react';
import { Sidebar } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { KNOWLEDGE_BASE_PATH } from '@/knowledgebase/constants';
import { TKnowledgeBaseSection } from '@/knowledgebase/types';

const SECTIONS = [
  {
    value: 'articles' as const,
    icon: IconFileText,
    key: 'articles',
    label: 'Articles',
  },
  {
    value: 'categories' as const,
    icon: IconFolders,
    key: 'kb-categories',
    label: 'Categories',
  },
  {
    value: 'kbsettings' as const,
    icon: IconSettings,
    key: 'settings',
    label: 'Settings',
  },
];

export const KnowledgeBaseSidebar = ({
  topicId,
  section,
}: {
  topicId: string;
  section: TKnowledgeBaseSection;
}) => {
  const { t } = useTranslation('frontline');

  return (
    <Sidebar collapsible="none" className="flex-none border-r">
      <Sidebar.Group>
        <Sidebar.GroupLabel>
          {t('knowledge-base', 'Knowledge Base')}
        </Sidebar.GroupLabel>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {SECTIONS.map((item) => (
              <Sidebar.MenuItem key={item.value}>
                <Sidebar.MenuButton asChild isActive={section === item.value}>
                  <Link to={`${KNOWLEDGE_BASE_PATH}/${topicId}/${item.value}`}>
                    <item.icon className="size-4" />
                    <span>{t(item.key, item.label)}</span>
                  </Link>
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            ))}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar>
  );
};
