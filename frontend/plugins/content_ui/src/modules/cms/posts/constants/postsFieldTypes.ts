import {
  IconAlignJustified,
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

export function usePostsFieldTypes(): IPostsFieldType[] {
  const { t } = useTranslation('content');
  return [
    { value: PostsPath.Posts, label: t('posts'), icon: IconFileText },
    { value: PostsPath.Pages, label: t('pages'), icon: IconFile },
    { value: PostsPath.Categories, label: t('categories'), icon: IconFolder },
    { value: PostsPath.Tags, label: t('tags'), icon: IconTag },
    { value: PostsPath.Menus, label: t('menus'), icon: IconMenu },
    {
      value: PostsPath.CustomFields,
      label: t('custom-fields'),
      icon: IconAlignJustified,
    },
    {
      value: PostsPath.CustomPostTypes,
      label: t('custom-post-types'),
      icon: IconLayout,
    },
    { value: PostsPath.Settings, label: t('settings'), icon: IconSettings },
  ];
}
