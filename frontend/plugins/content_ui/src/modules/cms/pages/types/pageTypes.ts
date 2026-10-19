import type { PageDetailQuery, PageListQuery } from '~/gql/graphql';
import { CustomFieldValue } from '../../posts/CustomFieldInput';

export type IPage = NonNullable<
  NonNullable<NonNullable<PageListQuery['cmsPageList']>['pages']>[number]
>;

export type IPageDetail = NonNullable<PageDetailQuery['cmsPage']>;

export interface IPageDrawerProps {
  page?: IPageDetail;
  onClose: () => void;
  clientPortalId: string;
}

export interface IPageFormData {
  name: string;
  path: string;
  description?: string;
  parentId?: string;
  status: string;
  clientPortalId: string;
  thumbnail?: { url: string; name?: string; type?: string } | null;
  gallery?: string[];
  videoUrl?: string;
  documents?: string[];
  attachments?: string[];
  customFieldsData?: { field: string; value: CustomFieldValue }[];
}

export interface IPagesRecordTableProps {
  clientPortalId: string;
  onEdit: (page: IPage) => void;
}
