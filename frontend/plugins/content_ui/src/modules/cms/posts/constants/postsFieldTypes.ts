import {
  IconAlignJustified,
  IconChartHistogram,
  IconFile,
  IconFileText,
  IconFolder,
  IconLayout,
  IconMenu,
  IconSettings,
  IconTag,
} from '@tabler/icons-react';
import { ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import { PostsPath } from '../types/path/PostsPath';

export interface IPostsFieldType {
  value: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

type UsePostsFieldTypesOptions = {
  showAnalytics?: boolean;
};

export function usePostsFieldTypes({
  showAnalytics = true,
}: UsePostsFieldTypesOptions = {}): IPostsFieldType[] {
  const { t } = useTranslation('common');

  const postsFieldTypes = [
    { value: PostsPath.Posts, label: 'Posts', icon: IconFileText },
    { value: PostsPath.Pages, label: 'Pages', icon: IconFile },
    { value: PostsPath.Categories, label: 'Categories', icon: IconFolder },
    { value: PostsPath.Tags, label: 'Tags', icon: IconTag },
    { value: PostsPath.Menus, label: 'Menus', icon: IconMenu },
    {
      value: PostsPath.CustomFields,
      label: 'Custom Fields',
      icon: IconAlignJustified,
    },
    {
      value: PostsPath.CustomPostTypes,
      label: 'Custom Post Types',
      icon: IconLayout,
    },
    {
      value: PostsPath.Analytics,
      label: t('cms.analytics.navigation-label'),
      icon: IconChartHistogram,
    },
    { value: PostsPath.Settings, label: 'Settings', icon: IconSettings },
  ];

  return showAnalytics
    ? postsFieldTypes
    : postsFieldTypes.filter((item) => item.value !== PostsPath.Analytics);
}
