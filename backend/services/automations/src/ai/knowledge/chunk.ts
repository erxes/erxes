import { parseKnowledgeFrontmatter } from './frontmatter';
import {
  detectKnowledgeLanguage,
  estimateKnowledgeTokenCount,
  extractKnowledgeTerms,
  getKnowledgeByteSize,
  hashKnowledgeContent,
  uniqueKnowledgeValues,
} from './normalize';
import {
  TAiKnowledgeChunk,
  TAiKnowledgeChunkerConfig,
  TAiKnowledgeLanguage,
  TAiKnowledgeMetadata,
  TAiKnowledgePriority,
  TAiKnowledgeSourceFile,
} from './types';

const DEFAULT_MAX_CHUNK_BYTES = 6000;
const DEFAULT_MIN_CHUNK_BYTES = 400;

type TMarkdownSection = {
  title?: string;
  headingPath: string[];
  content: string;
};

const normalizeMetadataList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return uniqueKnowledgeValues(value.map((item) => String(item || '')));
  }

  if (typeof value === 'string') {
    return uniqueKnowledgeValues(
      value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    );
  }

  return [];
};

const normalizePriority = (value: unknown): TAiKnowledgePriority => {
  if (
    value === 'low' ||
    value === 'normal' ||
    value === 'high' ||
    value === 'always'
  ) {
    return value;
  }

  return 'normal';
};

const normalizeLanguage = (
  value: unknown,
  content: string,
): TAiKnowledgeLanguage => {
  if (
    value === 'mn' ||
    value === 'en' ||
    value === 'mixed' ||
    value === 'unknown'
  ) {
    return value;
  }

  return detectKnowledgeLanguage(content);
};

const parseMarkdownSections = (content: string): TMarkdownSection[] => {
  const sections: TMarkdownSection[] = [];
  const headingStack: string[] = [];
  let currentTitle: string | undefined;
  let currentPath: string[] = [];
  let currentLines: string[] = [];

  const flush = () => {
    const sectionContent = currentLines.join('\n').trim();

    if (!sectionContent) {
      return;
    }

    sections.push({
      title: currentTitle,
      headingPath: currentPath,
      content: sectionContent,
    });
  };

  for (const line of content.split('\n')) {
    const headingMatch = /^(#{1,6})\s+(.+)$/.exec(line.trim());

    if (headingMatch) {
      flush();

      const level = headingMatch[1].length;
      const title = headingMatch[2].trim();

      headingStack.splice(level - 1);
      headingStack[level - 1] = title;

      currentTitle = title;
      currentPath = headingStack.filter(Boolean);
      currentLines = [line];
      continue;
    }

    currentLines.push(line);
  }

  flush();

  if (sections.length) {
    return sections;
  }

  return [
    {
      content: content.trim(),
      headingPath: [],
    },
  ];
};

const splitOversizedSection = (
  section: TMarkdownSection,
  maxChunkBytes: number,
) => {
  if (getKnowledgeByteSize(section.content) <= maxChunkBytes) {
    return [section];
  }

  const chunks: TMarkdownSection[] = [];
  let buffer: string[] = [];

  const flush = () => {
    const content = buffer.join('\n\n').trim();

    if (!content) {
      return;
    }

    chunks.push({
      ...section,
      content,
    });
    buffer = [];
  };

  for (const paragraph of section.content.split(/\n\s*\n/g)) {
    const nextBuffer = [...buffer, paragraph];
    const nextContent = nextBuffer.join('\n\n');

    if (
      buffer.length &&
      getKnowledgeByteSize(nextContent) > maxChunkBytes
    ) {
      flush();
    }

    if (getKnowledgeByteSize(paragraph) > maxChunkBytes) {
      chunks.push({
        ...section,
        content: paragraph.slice(0, maxChunkBytes),
      });
      continue;
    }

    buffer.push(paragraph);
  }

  flush();

  return chunks;
};

const mergeSmallSections = (
  sections: TMarkdownSection[],
  minChunkBytes: number,
  maxChunkBytes: number,
) => {
  const merged: TMarkdownSection[] = [];
  let pending: TMarkdownSection | null = null;

  const pushPending = () => {
    if (pending) {
      merged.push(pending);
      pending = null;
    }
  };

  for (const section of sections) {
    if (!pending) {
      pending = section;
      continue;
    }

    const combinedContent = `${pending.content}\n\n${section.content}`;
    const canMerge =
      getKnowledgeByteSize(pending.content) < minChunkBytes &&
      getKnowledgeByteSize(combinedContent) <= maxChunkBytes;

    if (!canMerge) {
      pushPending();
      pending = section;
      continue;
    }

    pending = {
      title: section.title || pending.title,
      headingPath: section.headingPath.length
        ? section.headingPath
        : pending.headingPath,
      content: combinedContent,
    };
  }

  pushPending();

  return merged;
};

export const buildAiKnowledgeChunks = (
  source: TAiKnowledgeSourceFile,
  config: TAiKnowledgeChunkerConfig = {},
): TAiKnowledgeChunk[] => {
  const maxChunkBytes = config.maxChunkBytes || DEFAULT_MAX_CHUNK_BYTES;
  const minChunkBytes = config.minChunkBytes || DEFAULT_MIN_CHUNK_BYTES;
  const parsed = parseKnowledgeFrontmatter(source.content);
  const metadata: TAiKnowledgeMetadata = {
    ...(parsed.metadata || {}),
    ...(source.metadata || {}),
  };
  const topics = normalizeMetadataList(metadata.topics);
  const metadataKeywords = normalizeMetadataList(metadata.keywords);
  const priority = normalizePriority(metadata.priority);
  const sections = mergeSmallSections(
    parseMarkdownSections(parsed.body).flatMap((section) =>
      splitOversizedSection(section, maxChunkBytes),
    ),
    minChunkBytes,
    maxChunkBytes,
  );

  return sections.map((section, chunkIndex) => {
    const content = section.content.trim();
    const keywords = uniqueKnowledgeValues([
      ...metadataKeywords,
      ...extractKnowledgeTerms(section.title || '').slice(0, 8),
      ...extractKnowledgeTerms(content).slice(0, 24),
    ]);
    const language = normalizeLanguage(metadata.language, content);

    return {
      agentId: source.agentId,
      fileId: source.fileId,
      fileName: source.fileName,
      chunkIndex,
      title: section.title,
      headingPath: section.headingPath,
      content,
      contentHash: hashKnowledgeContent(content),
      byteSize: getKnowledgeByteSize(content),
      tokenCount: estimateKnowledgeTokenCount(content),
      topics,
      keywords,
      priority,
      language,
      metadata,
    };
  });
};
