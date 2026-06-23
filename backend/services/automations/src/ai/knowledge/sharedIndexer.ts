import type {
  TKnowledgeDocument,
  TKnowledgeSourceReference,
} from 'erxes-api-shared/utils';
import type { IModels } from '../../connectionResolver';
import { buildAiKnowledgeChunks } from './chunk';
import { normalizeKnowledgeDocumentContent } from './content';

const getSourceUpdatedAt = (source: TKnowledgeSourceReference) => {
  const updatedAt = new Date(source.updatedAt);

  if (Number.isNaN(updatedAt.getTime())) {
    throw new Error('Knowledge source updatedAt must be a valid ISO date.');
  }

  return updatedAt;
};

const hasNewerSourceVersion = async ({
  models,
  source,
}: {
  models: IModels;
  source: TKnowledgeSourceReference;
}) => {
  const latestChunk = await models.KnowledgeChunks.findOne({
    sourceType: source.type,
    sourceId: source.id,
  })
    .sort({ sourceUpdatedAt: -1 })
    .lean();

  if (!latestChunk) {
    return false;
  }

  return latestChunk.sourceUpdatedAt > getSourceUpdatedAt(source);
};

export const indexKnowledgeDocument = async ({
  models,
  document,
}: {
  models: IModels;
  document: TKnowledgeDocument;
}) => {
  const content = normalizeKnowledgeDocumentContent({
    content: document.content,
    format: document.contentFormat,
  });

  if (!content) {
    throw new Error('Knowledge document content is required.');
  }

  if (
    await hasNewerSourceVersion({
      models,
      source: document.source,
    })
  ) {
    return {
      chunkCount: 0,
      sourceId: document.source.id,
      sourceType: document.source.type,
      status: 'skipped' as const,
    };
  }

  const sourceUpdatedAt = getSourceUpdatedAt(document.source);
  const tags = document.metadata.tags || [];
  const chunks = buildAiKnowledgeChunks({
    fileId: document.source.id,
    fileName: document.title,
    content,
    metadata: {
      ...document.metadata,
      keywords: tags,
      topics: tags,
    },
  });

  await models.KnowledgeChunks.deleteMany({
    sourceType: document.source.type,
    sourceId: document.source.id,
  });

  if (chunks.length) {
    await models.KnowledgeChunks.insertMany(
      chunks.map((chunk) => ({
        sourceType: document.source.type,
        sourceId: document.source.id,
        sourceVersion: document.source.version,
        sourceUpdatedAt,
        sourceUrl: document.source.url,
        visibility: document.metadata.visibility,
        title: chunk.title || document.title,
        chunkIndex: chunk.chunkIndex,
        headingPath: chunk.headingPath,
        content: chunk.content,
        contentHash: chunk.contentHash,
        byteSize: chunk.byteSize,
        tokenCount: chunk.tokenCount,
        topics: chunk.topics,
        keywords: chunk.keywords,
        priority: chunk.priority,
        language: chunk.language,
        metadata: chunk.metadata,
      })),
      { ordered: true },
    );
  }

  return {
    chunkCount: chunks.length,
    sourceId: document.source.id,
    sourceType: document.source.type,
    status: 'indexed' as const,
  };
};

export const removeKnowledgeDocument = async ({
  models,
  source,
}: {
  models: IModels;
  source: TKnowledgeSourceReference;
}) => {
  if (await hasNewerSourceVersion({ models, source })) {
    return {
      sourceId: source.id,
      sourceType: source.type,
      status: 'skipped' as const,
    };
  }

  await models.KnowledgeChunks.deleteMany({
    sourceType: source.type,
    sourceId: source.id,
  });

  return {
    sourceId: source.id,
    sourceType: source.type,
    status: 'removed' as const,
  };
};
