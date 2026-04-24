import {
  TCoreModuleProducerContext,
  TInsertImportRowsInput,
  TGetImportHeadersOutput,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { processPostRows } from './processPostRows';

const postImportMap = {
  post: {
    headers: [
      { label: 'Title', key: 'title' },
      { label: 'Slug', key: 'slug' },
      { label: 'Client Portal ID', key: 'clientPortalId' },
      { label: 'Type', key: 'type' },
      { label: 'Content', key: 'content' },
      { label: 'Excerpt', key: 'excerpt' },
      { label: 'Status', key: 'status' },
      { label: 'Author Kind', key: 'authorKind' },
      { label: 'Author ID', key: 'authorId' },
      { label: 'Web ID', key: 'webId' },
      { label: 'Categories', key: 'categoryIds' },
      { label: 'Tags', key: 'tagIds' },
      { label: 'Featured', key: 'featured' },
      { label: 'Published Date', key: 'publishedDate' },
      { label: 'Scheduled Date', key: 'scheduledDate' },
      { label: 'Video URL', key: 'videoUrl' },
    ],
    processRows: (models: IModels, rows: any[]) => processPostRows(models, rows),
  },
};

export const postImportHandlers = {
  getImportHeaders: async (
    { collectionName }: { collectionName: string },
    _ctx: TCoreModuleProducerContext<IModels>,
  ): Promise<TGetImportHeadersOutput> => {
    const handler = postImportMap[collectionName as keyof typeof postImportMap];
    if (!handler)
      throw new Error(`Import headers handler not found for ${collectionName}`);
    return handler.headers;
  },
  insertImportRows: async (
    { collectionName, rows }: TInsertImportRowsInput,
    { models }: TCoreModuleProducerContext<IModels>,
  ) => {
    const handler = postImportMap[collectionName as keyof typeof postImportMap];
    if (!handler)
      throw new Error(`Import handler not found for ${collectionName}`);
    return handler.processRows(models, rows);
  },
};
