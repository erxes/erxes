import { TranslationData } from '../../shared/hooks/useCmsTranslation';

export interface CmsConfig {
  clientPortalId: string;
  languages?: string[];
  language?: string;
}

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
  linkType?: string;
  kind: string;
  parentId?: string;
  target?: string;
  language?: string;
  translations?: TranslationInput[];
}

export interface MenuRecord {
  _id: string;
  label: string;
  url?: string;
  contentType?: string;
  contentTypeId?: string;
  type?: 'cms' | 'web';
  linkType?: string;
  kind?: string;
  parentId?: string;
  target?: string;
}

export interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  clientPortalId: string;
  menu?: MenuRecord;
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
  slug: string;
  name?: string;
  title?: string;
}

export interface MenuCustomType {
  _id: string;
  code: string;
  label: string;
}

export { TranslationData };
