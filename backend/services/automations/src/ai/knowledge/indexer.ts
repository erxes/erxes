import { readFileFromStorage } from 'erxes-api-shared/utils';
import type { IModels } from '../../connectionResolver';
import type { TAiAgentFile } from '../aiAgent';
import { buildAiKnowledgeChunks } from './chunk';
import { hashKnowledgeContent } from './normalize';
import { TAiKnowledgeMetadata } from './types';

type TAiKnowledgeIndexFileParams = {
  models: IModels;
  subdomain: string;
  agentId: string;
  file: TAiAgentFile;
  metadata?: TAiKnowledgeMetadata;
};

type TAiKnowledgeIndexAgentParams = {
  models: IModels;
  subdomain: string;
  agentId: string;
  files: TAiAgentFile[];
};

const buildFileUpdate = (value: Record<string, unknown>) => {
  const $set: Record<string, unknown> = {};
  const $unset: Record<string, ''> = {};

  for (const [key, fieldValue] of Object.entries(value)) {
    const path = `context.files.$[file].${key}`;

    if (typeof fieldValue === 'undefined') {
      $unset[path] = '';
      continue;
    }

    $set[path] = fieldValue;
  }

  return {
    ...(Object.keys($set).length ? { $set } : {}),
    ...(Object.keys($unset).length ? { $unset } : {}),
  };
};

const updateAgentFileIndexState = async ({
  models,
  agentId,
  fileId,
  state,
}: {
  models: IModels;
  agentId: string;
  fileId: string;
  state: Record<string, unknown>;
}) => {
  await models.AiAgents.updateOne(
    { _id: agentId, 'context.files.id': fileId },
    buildFileUpdate(state),
    {
      arrayFilters: [{ 'file.id': fileId }],
    },
  );
};

export const indexAiAgentKnowledgeFile = async ({
  models,
  subdomain,
  agentId,
  file,
  metadata,
}: TAiKnowledgeIndexFileParams) => {
  await updateAgentFileIndexState({
    models,
    agentId,
    fileId: file.id,
    state: {
      status: 'indexing',
      indexError: undefined,
    },
  });

  try {
    const buffer = await readFileFromStorage({
      subdomain,
      key: file.key,
    });

    if (!buffer) {
      throw new Error(`Context file "${file.name}" could not be read.`);
    }

    const content = buffer.toString('utf-8').trim();

    if (!content) {
      throw new Error(`Context file "${file.name}" is empty.`);
    }

    const contentHash = hashKnowledgeContent(content);
    const chunks = buildAiKnowledgeChunks({
      agentId,
      fileId: file.id,
      fileName: file.name,
      content,
      metadata: {
        ...(metadata || {}),
        purpose: file.purpose || 'knowledge',
      },
    });

    await models.AiAgentKnowledgeChunks.deleteMany({
      agentId,
      fileId: file.id,
    });

    if (chunks.length) {
      await models.AiAgentKnowledgeChunks.insertMany(chunks, { ordered: true });
    }

    await updateAgentFileIndexState({
      models,
      agentId,
      fileId: file.id,
      state: {
        status: 'indexed',
        chunkCount: chunks.length,
        indexedAt: new Date(),
        contentHash,
        indexError: undefined,
      },
    });

    return {
      fileId: file.id,
      fileName: file.name,
      status: 'indexed' as const,
      chunkCount: chunks.length,
      contentHash,
    };
  } catch (error) {
    const message = (error as Error).message;

    await models.AiAgentKnowledgeChunks.deleteMany({
      agentId,
      fileId: file.id,
    });

    await updateAgentFileIndexState({
      models,
      agentId,
      fileId: file.id,
      state: {
        status: 'failed',
        chunkCount: 0,
        indexedAt: new Date(),
        indexError: message,
      },
    });

    return {
      fileId: file.id,
      fileName: file.name,
      status: 'failed' as const,
      chunkCount: 0,
      error: message,
    };
  }
};

export const indexAiAgentKnowledgeFiles = async ({
  models,
  subdomain,
  agentId,
  files,
}: TAiKnowledgeIndexAgentParams) => {
  const results: Awaited<ReturnType<typeof indexAiAgentKnowledgeFile>>[] = [];

  for (const file of files) {
    results.push(
      await indexAiAgentKnowledgeFile({
        models,
        subdomain,
        agentId,
        file,
      }),
    );
  }
  console.log({ results });

  return results;
};
