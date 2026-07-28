import type { DefaultJobOptions } from 'bullmq';
import { sendWorkerQueue } from './mq-worker';

export type TKnowledgeVisibility = 'public' | 'internal';

export type TKnowledgeContentFormat = 'html' | 'markdown' | 'text';

export type TKnowledgeSourceReference = {
  type: string;
  id: string;
  version: string;
  updatedAt: string;
  url?: string;
};

export type TKnowledgeDocumentMetadata = {
  visibility: TKnowledgeVisibility;
  language?: 'mn' | 'en' | 'mixed' | 'unknown';
  tags?: string[];
  relatedEntityIds?: string[];
  [key: string]: unknown;
};

export type TKnowledgeDocument = {
  source: TKnowledgeSourceReference;
  title: string;
  content: string;
  contentFormat?: TKnowledgeContentFormat;
  metadata: TKnowledgeDocumentMetadata;
};

export type TAiKnowledgeSourceReference = {
  pluginName: string;
  moduleName: string;
  key: string;
  sourceId: string;
  updatedAt: string;
};

export const buildKnowledgeSourceType = ({
  pluginName,
  moduleName,
  key,
}: Pick<TAiKnowledgeSourceReference, 'pluginName' | 'moduleName' | 'key'>) =>
  `${pluginName}:${moduleName}:${key}`;

export type TKnowledgeIndexJob =
  | {
      operation: 'upsert';
      document: TKnowledgeDocument;
    }
  | {
      operation: 'remove';
      source: TKnowledgeSourceReference;
    };

export const enqueueKnowledgeIndexJob = async ({
  subdomain,
  job,
  jobOptions,
}: {
  subdomain: string;
  job: TKnowledgeIndexJob;
  jobOptions?: DefaultJobOptions;
}) => {
  const source = job.operation === 'upsert' ? job.document.source : job.source;
  const queue = sendWorkerQueue('automations', 'aiAgent');

  return queue.add(
    'indexKnowledgeDocument',
    {
      subdomain,
      data: job,
    },
    {
      attempts: 2,
      jobId: `knowledge:${source.type}:${source.id}:${job.operation}:${source.version}:${source.updatedAt}`,
      removeOnComplete: true,
      removeOnFail: true,
      ...jobOptions,
    },
  );
};

export const enqueueAiKnowledgeSourceRefreshJob = async ({
  subdomain,
  source,
  jobOptions,
}: {
  subdomain: string;
  source: TAiKnowledgeSourceReference;
  jobOptions?: DefaultJobOptions;
}) => {
  const queue = sendWorkerQueue('automations', 'aiAgent');

  return queue.add(
    'refreshAiKnowledgeSource',
    { subdomain, data: { source } },
    {
      attempts: 2,
      jobId: `knowledge-source:${source.pluginName}:${source.moduleName}:${source.key}:${source.sourceId}:${source.updatedAt}`,
      removeOnComplete: true,
      removeOnFail: true,
      ...jobOptions,
    },
  );
};
