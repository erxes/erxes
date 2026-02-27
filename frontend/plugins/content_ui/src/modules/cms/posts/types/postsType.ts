export interface Posts {
  _id: string;
  title: string;
  slug?: string;
  content?: string;
  status: string;
  type: string;
  featured: boolean;
  tagIds: string[];
  categoryIds?: string[];
  authorId: string;
  createdAt: string;
  updatedAt: string;
  scheduledDate?: string;
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
  author?: {
    __typename: string;
    username?: string;
    email?: string;
    details?: {
      __typename: string;
      fullName?: string;
      shortName?: string;
      avatar?: string;
      firstName?: string;
      lastName?: string;
      middleName?: string;
    };
  };
  customFieldsData?: any;
  __typename: string;
}
