import { IModels } from '~/connectionResolvers';

const VALID_STATUSES = ['draft', 'published', 'scheduled', 'archived'];
const VALID_AUTHOR_KINDS = ['user', 'portalUser'];

function parseList(value: any): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  return String(value)
    .split(/[;,]/)
    .map((v) => v.trim())
    .filter(Boolean);
}

function slugify(s: string): string {
  return String(s)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0400-\u04FF\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function preparePostDoc(row: any): any {
  const title = row.title || row.Title || '';
  const doc: any = {
    title,
    type: row.type || row.Type || 'post',
    content: row.content || row.Content || '',
    excerpt: row.excerpt || row.Excerpt || '',
  };

  const clientPortalId = row.clientPortalId || row['Client Portal ID'];
  if (clientPortalId) doc.clientPortalId = clientPortalId;

  const slug = row.slug || row.Slug;
  doc.slug = slug ? String(slug).trim() : slugify(title);

  const statusVal = (row.status || row.Status || '').toString().toLowerCase();
  if (statusVal && VALID_STATUSES.includes(statusVal)) {
    doc.status = statusVal;
  }

  const authorKind = (row.authorKind || row['Author Kind'] || '')
    .toString()
    .toLowerCase();
  if (authorKind && VALID_AUTHOR_KINDS.includes(authorKind)) {
    doc.authorKind = authorKind;
  }

  if (row.authorId || row['Author ID']) {
    doc.authorId = row.authorId || row['Author ID'];
  }

  if (row.webId || row['Web ID']) {
    doc.webId = row.webId || row['Web ID'];
  }

  const categories = parseList(row.categoryIds || row.Categories);
  if (categories.length) doc.categoryIds = categories;

  const tags = parseList(row.tagIds || row.Tags);
  if (tags.length) doc.tagIds = tags;

  const featured = row.featured ?? row.Featured;
  if (featured !== undefined && featured !== '') {
    doc.featured = ['true', '1', 'yes'].includes(
      String(featured).toLowerCase(),
    );
  }

  if (row.publishedDate || row['Published Date']) {
    const d = new Date(row.publishedDate || row['Published Date']);
    if (!isNaN(d.getTime())) doc.publishedDate = d;
  }

  if (row.scheduledDate || row['Scheduled Date']) {
    const d = new Date(row.scheduledDate || row['Scheduled Date']);
    if (!isNaN(d.getTime())) doc.scheduledDate = d;
  }

  if (row.videoUrl || row['Video URL']) {
    doc.videoUrl = row.videoUrl || row['Video URL'];
  }

  return doc;
}

export async function processPostRows(
  models: IModels,
  rows: any[],
): Promise<{ successRows: any[]; errorRows: any[] }> {
  const successRows: any[] = [];
  const errorRows: any[] = [];

  for (const row of rows) {
    try {
      const doc = preparePostDoc(row);

      if (!doc.title) {
        errorRows.push({ ...row, error: 'Title is required' });
        continue;
      }

      if (!doc.clientPortalId) {
        errorRows.push({ ...row, error: 'Client Portal ID is required' });
        continue;
      }

      // Prevent duplicate slug
      const existing = await models.Posts.findOne({
        slug: doc.slug,
        clientPortalId: doc.clientPortalId,
      }).lean();

      if (existing) {
        errorRows.push({
          ...row,
          error: `Post with slug "${doc.slug}" already exists`,
        });
        continue;
      }

      const post = await models.Posts.createPost(doc);
      successRows.push({ ...row, _id: post._id });
    } catch (e: any) {
      errorRows.push({ ...row, error: e?.message || 'Failed to import post' });
    }
  }

  return { successRows, errorRows };
}
