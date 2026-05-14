import { ISegment } from 'ui-modules';

export const generateOrderPath = (items: ISegment[]) => {
  const map = new Map(items.map((item) => [item._id, item]));

  const childrenMap = new Map<string, ISegment[]>();

  items.forEach((item) => {
    const parentId = item.subOf || '';
    if (parentId) {
      if (!childrenMap.has(parentId)) {
        childrenMap.set(parentId, []);
      }
      childrenMap.get(parentId)!.push(item);
    }
  });

  const getOrder = (_id: string): string => {
    const item = map.get(_id);
    if (!item) return '';
    const parentId = item.subOf || '';
    if (!parentId) return _id;
    return `${getOrder(parentId)}/${_id}`;
  };

  const result: Array<ISegment & { order: string; hasChildren: boolean }> = [];

  const traverse = (item: ISegment) => {
    const order = getOrder(item._id || '');
    const hasChildren = childrenMap.has(item._id || '');

    result.push({
      ...item,
      order,
      hasChildren,
    });

    const children = childrenMap.get(item._id || '') || [];
    children.forEach((child) => traverse(child));
  };

  const rootItems = items.filter((item) => !item.subOf || item.subOf === '');

  rootItems.forEach((root) => traverse(root));

  return result;
};
