import { ComponentType, FC } from 'react';

export type BlockLevel = 'atom' | 'molecule' | 'organism';

export type CmsRefKind = 'cmsCategory' | 'cmsMenu' | 'cmsCustomPostType';

export type PropSchemaEntry =
  | { type: 'text'; label: string; placeholder?: string }
  | { type: 'longText'; label: string; placeholder?: string }
  | { type: 'image'; label: string; placeholder?: string }
  | { type: 'url'; label: string; placeholder?: string }
  | { type: 'select'; label: string; options: { value: string; label: string }[] }
  | { type: 'number'; label: string; min?: number; max?: number }
  | { type: 'color'; label: string }
  | { type: 'cmsRef'; label: string; kind: CmsRefKind };

export interface BlockRenderProps<P = Record<string, unknown>> {
  props: P;
  clientPortalId: string;
  isPreview?: boolean;
}

export interface BlockDefinition<P = Record<string, unknown>> {
  key: string;
  level: BlockLevel;
  category: string;
  label: string;
  description?: string;
  icon: ComponentType<{ className?: string; size?: number | string }>;
  defaultProps: P;
  propSchema: Record<string, PropSchemaEntry>;
  // For organisms backed by a CMS entity. The selected entity id is held in
  // BlockInstance.contentTypeId so the backend can later persist the link.
  contentType?: string;
  Render: FC<BlockRenderProps<P>>;
}

export interface BlockInstance {
  _id: string;
  key: string;
  props: Record<string, unknown>;
  contentType?: string;
  contentTypeId?: string;
}
