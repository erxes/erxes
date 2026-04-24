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
    { label: 'Author', key: 'authorId', isDefault: true },
    { label: 'Web ID', key: 'webId' },
    { label: 'Categories', key: 'categoryIds' },
    { label: 'Tags', key: 'tagIds' },
    { label: 'Featured', key: 'featured' },
    { label: 'View Count', key: 'viewCount', isDefault: true },
    { label: 'Published Date', key: 'publishedDate' },
    { label: 'Scheduled Date', key: 'scheduledDate' },
    { label: 'Video URL', key: 'videoUrl' },
    { label: 'Created At', key: 'createdAt', isDefault: true },
    { label: 'Updated At', key: 'updatedAt' },
  ];
}
