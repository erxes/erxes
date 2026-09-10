export type CmsPost = {
  _id: string;
  title: string | null;
  excerpt: string | null;
  content: string | null;
  slug: string | null;
  publishedDate: string | null;
  createdAt: string | null;
  viewCount: number | null;
};

export type CmsPage = {
  _id: string;
  name: string | null;
  description: string | null;
  content: string | null;
  slug: string | null;
};
