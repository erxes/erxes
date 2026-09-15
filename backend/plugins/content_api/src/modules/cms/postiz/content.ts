export function publicArticleUrl(
  cms: {
    publicUrl?: string;
    domain?: string;
    postUrlPrefix?: string;
    postUrlField?: string;
  },
  post: { _id: string; slug?: string; count?: number },
) {
  const base = cms.publicUrl?.trim() || cms.domain?.trim() || '';
  let origin: URL;
  try {
    origin = new URL(base.includes('://') ? base : `https://${base}`);
  } catch {
    throw new Error('Set a public HTTPS URL in CMS settings before sharing');
  }
  if (origin.protocol !== 'https:' || origin.username || origin.password)
    throw new Error('Set a public HTTPS URL in CMS settings before sharing');
  const field = cms.postUrlField || '_id';
  const value =
    field === 'slug'
      ? post.slug
      : field === 'count'
      ? post.count
      : field === '_id'
      ? post._id
      : undefined;
  if (value === undefined || value === null || value === '')
    throw new Error('Set the CMS public post identifier before sharing');
  const prefix = cms.postUrlPrefix?.trim() || '/posts';
  if (prefix.includes('://') || prefix.includes('?') || prefix.includes('#'))
    throw new Error('Invalid CMS post URL prefix');
  origin.pathname = [
    origin.pathname.replace(/\/+$/, ''),
    prefix.replace(/^\/+|\/+$/g, ''),
    encodeURIComponent(String(value)),
  ]
    .filter(Boolean)
    .join('/');
  origin.search = '';
  origin.hash = '';
  return origin.href;
}

export function assertShareablePost(
  post: { type?: string; status?: string } | null,
) {
  if (!post || post.type !== 'post')
    throw new Error('Only ordinary CMS posts can be shared');
  if (post.status !== 'published')
    throw new Error('Publish the CMS post before sharing');
}
