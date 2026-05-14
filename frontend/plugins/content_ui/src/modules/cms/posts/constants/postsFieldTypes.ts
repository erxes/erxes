import {
  IconAlignJustified,
  IconFile,
  IconFileText,
  IconFolder,
  IconLayout,
  IconMenu,
  IconTag,
} from '@tabler/icons-react';
import { ComponentType } from 'react';
import { PostsPath } from '../types/path/PostsPath';

export interface IPostsFieldType {
  value: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

export function usePostsFieldTypes(): IPostsFieldType[] {
  return [
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
  ];
}
