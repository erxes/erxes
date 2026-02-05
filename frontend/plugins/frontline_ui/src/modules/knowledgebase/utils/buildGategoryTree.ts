export function buildCategoryTree(categories: any[]) {
  const byId = new Map<string, any>();
  const roots: any[] = [];

  (categories || []).forEach((c) => {
    if (!c?._id) return;
    byId.set(c._id, { ...c, children: [] });
  });

  byId.forEach((c) => {
    const parentId =
      c.parentCategoryId || c.parentId || c.parentCategory?._id || null;

    if (parentId === c._id) {
    roots.push(c);
    return;
  }

    if (parentId && byId.has(parentId)) {
      byId.get(parentId).children.push(c);
    } else {
      roots.push(c);
    }
  });

  return roots;
}
