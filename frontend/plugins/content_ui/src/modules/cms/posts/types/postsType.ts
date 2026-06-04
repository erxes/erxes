interface PostTaxonomyItem {
  _id: string;
  name: string;
}

interface PostAuthorDetails {
  __typename?: string;
  fullName?: string;
  shortName?: string;
  avatar?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
}

interface PostAuthor {
  __typename?: string;
  username?: string;
  email?: string;
  details?: PostAuthorDetails;
}

interface PostTranslationSummary {
  language: string;
}

export interface Posts {
  _id: string;
  count?: number;
  clientPortalId: string;
  title: string;
  slug?: string;
  content?: string;
  status: string;
  type: string;
  featured: boolean;
  tagIds: string[];
  categoryIds?: string[];
  authorId: string;
  authorKind?: string;
  author?: PostAuthor;
  viewCount?: number;
  createdAt: string;
  updatedAt: string;
  scheduledDate?: string;
  publishedDate?: string;
  autoArchiveDate?: string;
  excerpt?: string;
  thumbnail?: {
    url: string;
    __typename: string;
  };
  customPostType?: {
    _id: string;
    code: string;
    label: string;
    __typename: string;
  };
  categories?: PostTaxonomyItem[];
  tags?: PostTaxonomyItem[];
  translations?: PostTranslationSummary[];
  customFieldsData?: unknown;
  customFieldsMap?: unknown;
  __typename?: string;
}
