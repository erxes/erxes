export interface CmsTag {
  _id: string;
  name: string;
  slug: string;
  colorCode: string;
  clientPortalId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TagFormData {
  name: string;
  slug: string;
  clientPortalId: string;
  colorCode: string;
}
