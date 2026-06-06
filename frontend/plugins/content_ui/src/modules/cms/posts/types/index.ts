import { Posts } from './postsType';

export { Posts } from './postsType';
export { PostsHotKeyScope } from './PostsHotKeyScope';

export interface PostDetailResponse {
  cmsPost: Posts;
}

export interface PostInput {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  status?: string;
  featured?: boolean;
  featuredDate?: string;
  scheduledDate?: string;
  autoArchiveDate?: string;
  tagIds?: string[];
  categoryIds?: string[];
  customFieldsData?: any;
  customFieldsMap?: any;
  videoUrl?: string;
}

export interface PostEditVariables {
  id: string;
  input: PostInput;
}
