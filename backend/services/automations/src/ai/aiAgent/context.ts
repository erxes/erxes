import path from 'path';
import { readFileFromStorage } from 'erxes-api-shared/utils';
import {
  AI_AGENT_LIMITS,
  AI_AGENT_SUPPORTED_CONTEXT_FILE_EXTENSIONS,
  AI_AGENT_SUPPORTED_CONTEXT_FILE_TYPES,
} from './constants';
import { TAiAgentFile } from './contract';

export type TAiAgentLoadedContextFile = {
  id: string;
  key: string;
  name: string;
  bytes: number;
  content: string;
};

export type TAiAgentContextLoadResult = {
  files: TAiAgentLoadedContextFile[];
  totalBytes: number;
  errors: string[];
  warnings: string[];
};

const hasSupportedExtension = (fileName: string) => {
  const extension = path.extname(fileName).toLowerCase();
  return AI_AGENT_SUPPORTED_CONTEXT_FILE_EXTENSIONS.includes(
    extension as (typeof AI_AGENT_SUPPORTED_CONTEXT_FILE_EXTENSIONS)[number],
  );
};

const hasSupportedType = (fileType?: string) => {
  if (!fileType) {
    return true;
  }

  const normalizedType = fileType.split(';')[0].trim().toLowerCase();

  return AI_AGENT_SUPPORTED_CONTEXT_FILE_TYPES.includes(
    normalizedType as (typeof AI_AGENT_SUPPORTED_CONTEXT_FILE_TYPES)[number],
  );
};

const validateContextFileType = (file: TAiAgentFile) => {
  return hasSupportedExtension(file.name) || hasSupportedType(file.type);
};

export const loadAiAgentContextFiles = async (
  subdomain: string,
  files: TAiAgentFile[],
): Promise<TAiAgentContextLoadResult> => {
  const result: TAiAgentContextLoadResult = {
    files: [],
    totalBytes: 0,
    errors: [],
    warnings: [],
  };

  for (const file of files) {
    if (!validateContextFileType(file)) {
      result.errors.push(
        `Unsupported context file "${file.name}". Only markdown and plain text files are allowed.`,
      );
      continue;
    }

    if (
      typeof file.size === 'number' &&
      file.size > AI_AGENT_LIMITS.maxSingleFileBytes
    ) {
      result.errors.push(
        `Context file "${file.name}" is too large. Keep each file under ${AI_AGENT_LIMITS.maxSingleFileBytes} bytes.`,
      );
      continue;
    }

    try {
      const buffer = await readFileFromStorage({
        subdomain,
        key: file.key,
      });

      if (!buffer) {
        result.errors.push(`Context file "${file.name}" could not be read.`);
        continue;
      }

      if (buffer.length > AI_AGENT_LIMITS.maxSingleFileBytes) {
        result.errors.push(
          `Context file "${file.name}" is too large after loading. Keep each file under ${AI_AGENT_LIMITS.maxSingleFileBytes} bytes.`,
        );
        continue;
      }

      result.totalBytes += buffer.length;

      if (result.totalBytes > AI_AGENT_LIMITS.maxTotalContextBytes) {
        result.errors.push(
          `Combined context files are too large. Keep total context under ${AI_AGENT_LIMITS.maxTotalContextBytes} bytes.`,
        );
        continue;
      }

      const content = buffer.toString('utf-8').trim();

      if (!content) {
        result.warnings.push(`Context file "${file.name}" is empty.`);
        continue;
      }

      result.files.push({
        id: file.id,
        key: file.key,
        name: file.name,
        bytes: buffer.length,
        content,
      });
    } catch (error) {
      result.errors.push(
        `Failed to load context file "${file.name}": ${
          (error as Error).message
        }`,
      );
    }
  }

  return result;
};
