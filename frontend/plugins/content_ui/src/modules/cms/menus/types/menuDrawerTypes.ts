import type { CmsMenuListQuery, MenuLinkType } from '~/gql/graphql';
import { TranslationData } from '../../shared/hooks/useCmsTranslation';

export interface GraphQLErrorEntry {
  message: string;
  extensions?: { code?: string };
}

export interface TranslationInput {
  language: string;
  title: string;
  type: string;
}

export interface MenuInput {
  clientPortalId: string;
  label: string;
  url: string;
  contentType?: string;
  contentTypeId?: string;
  type?: 'cms' | 'web';
  linkType?: MenuLinkType;
  kind: string;
  parentId?: string;
  target?: string;
  language?: string;
  translations?: TranslationInput[];
}

export type MenuItem = NonNullable<
  NonNullable<CmsMenuListQuery['cmsMenuList']>[number]
> & {
  depth?: number;
  path?: string[];
};

export interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  clientPortalId: string;
  menu?: MenuItem;
}

export interface MenuFormData {
  label: string;
  url: string;
  kind: string;
  clientPortalId: string;
  parentId: string;
  contentType?: string;
  contentTypeId?: string;
  type?: 'cms' | 'web';
  linkType: string;
  target: boolean;
}

export interface MenuContentItem {
  _id: string;
  slug: string | null;
  name?: string | null;
  title?: string | null;
}

export interface MenuCustomType {
  _id: string;
  code: string;
  label: string;
}

export { TranslationData };
