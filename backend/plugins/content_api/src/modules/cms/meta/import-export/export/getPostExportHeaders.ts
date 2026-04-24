import {
  ImportHeaderDefinition,
  IImportExportContext,
} from 'erxes-api-shared/core-modules';

export async function getPostExportHeaders(
  _data: any,
  _ctx: IImportExportContext,
): Promise<ImportHeaderDefinition[]> {
  return [
    { label: 'Title', key: 'title', isDefault: true },
    { label: 'Slug', key: 'slug', isDefault: true },
    { label: 'Client Portal ID', key: 'clientPortalId', isDefault: true },
    { label: 'Type', key: 'type', isDefault: true },
    { label: 'Status', key: 'status', isDefault: true },
    { label: 'Excerpt', key: 'excerpt' },
    { label: 'Content', key: 'content' },
    { label: 'Author Kind', key: 'authorKind' },
    { label: 'Author ID', key: 'authorId', isDefault: true },
    { label: 'Author Name', key: 'authorName' },
    { label: 'Web ID', key: 'webId' },
    { label: 'Categories', key: 'categoryIds' },
    { label: 'Category Names', key: 'categoryNames' },
    { label: 'Tags', key: 'tagIds' },
    { label: 'Tag Names', key: 'tagNames' },
    { label: 'Featured', key: 'featured' },
    { label: 'View Count', key: 'viewCount', isDefault: true },
    { label: 'Published Date', key: 'publishedDate' },
    { label: 'Scheduled Date', key: 'scheduledDate' },
    { label: 'Video URL', key: 'videoUrl' },
    { label: 'Created At', key: 'createdAt', isDefault: true },
    { label: 'Updated At', key: 'updatedAt' },
  ];
}
