type Maps = {
  categoryMap: Map<string, string>;
  tagMap: Map<string, string>;
  userMap: Map<string, string>;
};

const joinNames = (ids: any[] | undefined, map: Map<string, string>) => {
  if (!ids?.length) return '';
  return ids
    .map((id) => map.get(String(id)) || String(id))
    .filter(Boolean)
    .join('; ');
};

const joinIds = (ids: any[] | undefined) => {
  if (!ids?.length) return '';
  return ids.map((id) => String(id)).join('; ');
};

export const buildPostExportRow = (
  post: any,
  selectedFields?: string[],
  maps?: Partial<Maps>,
): Record<string, any> => {
  const formatValue = (v: any) => (v == null ? '' : String(v));

  const authorName =
    post.authorId && post.authorKind === 'user'
      ? maps?.userMap?.get(String(post.authorId)) || ''
      : '';

  const allFields: Record<string, any> = {
    _id: formatValue(post._id),
    title: formatValue(post.title),
    slug: formatValue(post.slug),
    clientPortalId: formatValue(post.clientPortalId),
    type: formatValue(post.type),
    status: formatValue(post.status),
    excerpt: formatValue(post.excerpt),
    content: formatValue(post.content),
    authorKind: formatValue(post.authorKind),
    authorId: formatValue(post.authorId),
    authorName: formatValue(authorName),
    webId: formatValue(post.webId),
    categoryIds: formatValue(joinIds(post.categoryIds)),
    categoryNames: formatValue(
      joinNames(post.categoryIds, maps?.categoryMap || new Map()),
    ),
    tagIds: formatValue(joinIds(post.tagIds)),
    tagNames: formatValue(joinNames(post.tagIds, maps?.tagMap || new Map())),
    featured: formatValue(!!post.featured),
    viewCount: formatValue(post.viewCount ?? 0),
    publishedDate: formatValue(
      post.publishedDate ? new Date(post.publishedDate).toISOString() : '',
    ),
    scheduledDate: formatValue(
      post.scheduledDate ? new Date(post.scheduledDate).toISOString() : '',
    ),
    videoUrl: formatValue(post.videoUrl),
    createdAt: formatValue(
      post.createdAt ? new Date(post.createdAt).toISOString() : '',
    ),
    updatedAt: formatValue(
      post.updatedAt ? new Date(post.updatedAt).toISOString() : '',
    ),
  };

  if (selectedFields?.length) {
    const result: Record<string, any> = { _id: String(post._id || '') };
    for (const key of selectedFields) {
      result[key] = allFields[key] ?? '';
    }
    return result;
  }

  return allFields;
};
