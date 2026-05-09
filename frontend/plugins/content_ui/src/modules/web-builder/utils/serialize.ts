import { BlockInstance } from '../blocks/types';
import { BLOCK_REGISTRY } from '../blocks/registry';
import { IWebPageItem } from '../types';

export const newLocalId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `local-${Math.random().toString(36).slice(2)}-${Date.now()}`;
};

export const blockToPageItem = (block: BlockInstance, order: number) => {
  const def = BLOCK_REGISTRY[block.key];
  return {
    name: block.key,
    type: def?.level || 'organism',
    content: JSON.stringify(block.props ?? {}),
    order,
    contentType: block.contentType,
    contentTypeId: block.contentTypeId,
  };
};

export const pageItemToBlock = (item: IWebPageItem): BlockInstance => {
  const rawContent = item.content;
  let props: Record<string, unknown> = {};

  if (typeof rawContent === 'string') {
    try {
      props = rawContent ? JSON.parse(rawContent) : {};
    } catch {
      props = {};
    }
  } else if (rawContent && typeof rawContent === 'object') {
    props = rawContent as Record<string, unknown>;
  }

  return {
    _id: item._id,
    key: item.name || '',
    props,
    contentType: item.contentType,
    contentTypeId: item.contentTypeId,
  };
};

export const sortPageItems = (items: IWebPageItem[]): IWebPageItem[] =>
  [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
