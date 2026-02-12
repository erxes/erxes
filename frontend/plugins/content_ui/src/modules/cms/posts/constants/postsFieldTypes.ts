import { PostsPath } from '../types/path/PostsPath';

export function usePostsFieldTypes() {
  return [
    {
      value: PostsPath.Posts,
      label: 'Posts',
    },
    {
      value: PostsPath.Pages,
      label: 'Pages',
    },
    {
      value: PostsPath.Categories,
      label: 'Categories',
    },
    {
      value: PostsPath.Tags,
      label: 'Tags',
    },
    {
      value: PostsPath.CustomFields,
      label: 'Custom Fields',
    },
    {
      value: PostsPath.CustomPostTypes,
      label: 'Custom Post Types',
    },
  ];
}
