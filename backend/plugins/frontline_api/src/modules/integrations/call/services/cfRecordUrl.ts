import { sendToGrandStream, getUrl } from '../utils';
import FormData from 'form-data';
import fetch, { Response } from 'node-fetch';

// Type definitions
interface CfRecordUrlParams {
  fileDir: string;
  recordfiles: string;
  inboxIntegrationId: string;
  retryCount?: number;
}

interface ValidatedParams extends Required<CfRecordUrlParams> {
  fileName: string;
}

interface GrandStreamRequest {
  path: string;
  method: string;
  headers: Record<string, string>;
  data: {
    request: {
      action: string;
      filedir: string;
      filename: string;
    };
  };
  integrationId: string;
  retryCount: number;
  isConvertToJson: boolean;
}

interface FetchAudioParams {
  fileDir: string;
  fileName: string;
  inboxIntegrationId: string;
  retryCount: number;
  models: any; // Replace with your actual models type
  user: any; // Replace with your actual user type
  logger: Logger;
}

interface UploadParams {
  buffer: Buffer;
  fileName: string;
  subdomain: string;
  logger: Logger;
}

interface Logger {
  info: (message: string, meta?: Record<string, any>) => void;
  debug: (message: string, meta?: Record<string, any>) => void;
  error: (message: string, meta?: Record<string, any>) => void;
  warn: (message: string, meta?: Record<string, any>) => void;
}

interface ErrorDetails {
  [key: string]: any;
}

interface LogData {
  timestamp: string;
  level: string;
  context: string;
  message: string;
  pid: number;
  [key: string]: any;
}
// Error codes enum for better type safety
enum ErrorCodes {
  INVALID_PARAMS = 'INVALID_PARAMS',
  MISSING_RECORDFILES = 'MISSING_RECORDFILES',
  MISSING_INBOX_ID = 'MISSING_INBOX_ID',
  MISSING_FILE_DIR = 'MISSING_FILE_DIR',
  INVALID_RETRY_COUNT = 'INVALID_RETRY_COUNT',
  INVALID_FILENAME_FORMAT = 'INVALID_FILENAME_FORMAT',
  FILENAME_TOO_LONG = 'FILENAME_TOO_LONG',
  FILENAME_PARSE_ERROR = 'FILENAME_PARSE_ERROR',
  GRANDSTREAM_FETCH_ERROR = 'GRANDSTREAM_FETCH_ERROR',
  UPLOAD_HTTP_ERROR = 'UPLOAD_HTTP_ERROR',
  UPLOAD_TIMEOUT = 'UPLOAD_TIMEOUT',
  UPLOAD_ERROR = 'UPLOAD_ERROR',
  PROCESSING_FAILED = 'PROCESSING_FAILED',
}

class RecordUrlError extends Error {
  public readonly code: ErrorCodes;
  public readonly details: ErrorDetails;
  public readonly timestamp: string;

  constructor(message: string, code: ErrorCodes, details: ErrorDetails = {}) {
    super(message);
    this.name = 'RecordUrlError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RecordUrlError);
    }
  }
}

// Configuration constants
const CONFIG = {
  GRANDSTREAM_API: {
    PATH: 'api',
    METHOD: 'POST',
    HEADERS: { 'Content-Type': 'application/json' } as const,
    ACTION: 'recapi',
  },
  FILE: {
    SANITIZATION_PATTERN: /\+/g,
    SANITIZATION_REPLACEMENT: '_',
    MAX_FILE_SIZE: 20 * 1024 * 1024, // 20MB
    MAX_FILENAME_LENGTH: 255,
  },
  UPLOAD: {
    METHOD: 'POST' as const,
    TIMEOUT: 30000, // 30 seconds
    CONTENT_TYPE: 'audio/wav',
  },
  RETRY: {
    DEFAULT_COUNT: 1,
    MAX_COUNT: 3,
    BASE_DELAY: 1000, // 1 second
  },
} as const;

export const cfRecordUrl = async (
  params: CfRecordUrlParams,
  user: any,
  models: any,
  subdomain: string,
): Promise<string> => {
  const logger = createLogger('cfRecordUrl');
  const startTime = process.hrtime.bigint();

  try {
    logger.info('Processing record URL request', {
      inboxIntegrationId: params.inboxIntegrationId,
      retryCount: params.retryCount,
      nodeVersion: process.version,
      memoryUsage: process.memoryUsage(),
    });

    // Input validation and parsing
    const validatedParams = validateAndParseParams(params);
    const { fileDir, inboxIntegrationId, retryCount, fileName } =
      validatedParams;

    // Fetch audio file from GrandStream
    const audioBuffer = await fetchAudioFromGrandStream({
      fileDir,
      fileName,
      inboxIntegrationId,
      retryCount,
      models,
      user,
      logger,
    });

    const uploadResult = await uploadToCloudStorage({
      buffer: audioBuffer,
      fileName,
      subdomain,
      logger,
    });

    const endTime = process.hrtime.bigint();
    const executionTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds

    logger.info('Record URL processing completed successfully', {
      executionTimeMs: executionTime,
      memoryUsage: process.memoryUsage(),
    });

    return uploadResult;
  } catch (error) {
    const endTime = process.hrtime.bigint();
    const executionTime = Number(endTime - startTime) / 1000000;

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    const errorCode = error instanceof RecordUrlError ? error.code : 'UNKNOWN';
    const errorStack = error instanceof Error ? error.stack : undefined;

    logger.error('Record URL processing failed', {
      error: errorMessage,
      errorCode,
      stack: errorStack,
      executionTimeMs: executionTime,
      params: sanitizeLogParams(params),
      memoryUsage: process.memoryUsage(),
    });

    // Re-throw domain errors, wrap others
    if (error instanceof RecordUrlError) {
      throw error;
    }

    throw new RecordUrlError(
      'Failed to process record URL',
      ErrorCodes.PROCESSING_FAILED,
      {
        originalError: errorMessage,
        params: sanitizeLogParams(params),
        executionTimeMs: executionTime,
      },
    );
  }
};

const validateAndParseParams = (params: CfRecordUrlParams): ValidatedParams => {
  if (!params || typeof params !== 'object') {
    throw new RecordUrlError(
      'Invalid parameters object',
      ErrorCodes.INVALID_PARAMS,
    );
  }

  const { fileDir, recordfiles, inboxIntegrationId, retryCount } = params;

  // Required parameter validation
  if (!recordfiles || typeof recordfiles !== 'string') {
    throw new RecordUrlError(
      'Missing or invalid required parameter: recordfiles',
      ErrorCodes.MISSING_RECORDFILES,
    );
  }

  if (!inboxIntegrationId || typeof inboxIntegrationId !== 'string') {
    throw new RecordUrlError(
      'Missing or invalid required parameter: inboxIntegrationId',
      ErrorCodes.MISSING_INBOX_ID,
    );
  }

  if (!fileDir || typeof fileDir !== 'string') {
    throw new RecordUrlError(
      'Missing or invalid required parameter: fileDir',
      ErrorCodes.MISSING_FILE_DIR,
    );
  }

  // Validate retry count
  const validatedRetryCount = validateRetryCount(retryCount);

  // Parse filename from recordfiles path
  const fileName = extractFileName(recordfiles);

  return {
    fileDir,
    recordfiles,
    inboxIntegrationId,
    retryCount: validatedRetryCount,
    fileName,
  };
};

/**
 * Validates retry count parameter
 */
const validateRetryCount = (retryCount?: number): number => {
  if (retryCount === undefined || retryCount === null) {
    return CONFIG.RETRY.DEFAULT_COUNT;
  }

  if (typeof retryCount !== 'number') {
    throw new RecordUrlError(
      'Retry count must be a number',
      ErrorCodes.INVALID_RETRY_COUNT,
      { providedRetryCount: retryCount, type: typeof retryCount },
    );
  }

  if (
    !Number.isInteger(retryCount) ||
    retryCount < 0 ||
    retryCount > CONFIG.RETRY.MAX_COUNT
  ) {
    throw new RecordUrlError(
      `Invalid retry count. Must be an integer between 0 and ${CONFIG.RETRY.MAX_COUNT}`,
      ErrorCodes.INVALID_RETRY_COUNT,
      { providedRetryCount: retryCount },
    );
  }

  return retryCount;
};

/**
 * Extracts filename from recordfiles path
 */
const extractFileName = (recordfiles: string): string => {
  try {
    const filePathParts = recordfiles.split('/');
    const rawFileName = filePathParts[1]?.split('@')[0];

    if (!rawFileName || rawFileName.trim() === '') {
      throw new RecordUrlError(
        'Could not extract filename from recordfiles path',
        ErrorCodes.INVALID_FILENAME_FORMAT,
        { recordfiles, parsedParts: filePathParts },
      );
    }

    // Additional filename validation
    if (rawFileName.length > CONFIG.FILE.MAX_FILENAME_LENGTH) {
      throw new RecordUrlError(
        'Filename too long',
        ErrorCodes.FILENAME_TOO_LONG,
        { fileName: rawFileName, length: rawFileName.length },
      );
    }

    return rawFileName;
  } catch (error) {
    if (error instanceof RecordUrlError) throw error;

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new RecordUrlError(
      'Failed to parse recordfiles path',
      ErrorCodes.FILENAME_PARSE_ERROR,
      { recordfiles, originalError: errorMessage },
    );
  }
};

/**
 * Fetches audio file from GrandStream API with retry logic
 */
const fetchAudioFromGrandStream = async (
  params: FetchAudioParams,
): Promise<Buffer> => {
  const {
    fileDir,
    fileName,
    inboxIntegrationId,
    retryCount,
    models,
    user,
    logger,
  } = params;

  logger.debug('Fetching audio from GrandStream', {
    fileName,
    fileDir,
    retryCount,
    pid: process.pid,
  });

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retryCount; attempt++) {
    try {
      if (attempt > 0) {
        logger.warn(`Retry attempt ${attempt} for GrandStream fetch`, {
          fileName,
        });
        // Exponential backoff
        await sleep(Math.pow(2, attempt) * CONFIG.RETRY.BASE_DELAY);
      }

      const grandStreamRequest: GrandStreamRequest = {
        path: CONFIG.GRANDSTREAM_API.PATH,
        method: CONFIG.GRANDSTREAM_API.METHOD,
        headers: CONFIG.GRANDSTREAM_API.HEADERS,
        data: {
          request: {
            action: CONFIG.GRANDSTREAM_API.ACTION,
            filedir: fileDir,
            filename: fileName,
          },
        },
        integrationId: inboxIntegrationId,
        retryCount: 0, // Handle retries at this level
        isConvertToJson: false,
      };

      const grandStreamResponse = await sendToGrandStream(
        models,
        grandStreamRequest,
        user,
      );

      if (!grandStreamResponse) {
        throw new Error('No response received from GrandStream API');
      }

      const fileBuffer = await grandStreamResponse.arrayBuffer();

      if (!fileBuffer || fileBuffer.byteLength === 0) {
        throw new Error(
          `Received empty buffer. Buffer size: ${fileBuffer?.byteLength || 0}`,
        );
      }

      if (fileBuffer.byteLength > CONFIG.FILE.MAX_FILE_SIZE) {
        throw new Error(`File too large: ${fileBuffer.byteLength} bytes`);
      }

      const nodeBuffer = Buffer.from(fileBuffer);

      logger.debug('Successfully fetched audio buffer', {
        fileName,
        bufferSize: nodeBuffer.length,
        attempt: attempt + 1,
      });

      return nodeBuffer;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      logger.warn(`GrandStream fetch attempt ${attempt + 1} failed`, {
        fileName,
        error: lastError.message,
        attempt: attempt + 1,
        maxAttempts: retryCount + 1,
      });

      if (attempt === retryCount) {
        break; // No more retries
      }
    }
  }

  throw new RecordUrlError(
    'Failed to fetch audio from GrandStream API after all retry attempts',
    ErrorCodes.GRANDSTREAM_FETCH_ERROR,
    {
      fileName,
      fileDir,
      inboxIntegrationId,
      attempts: retryCount + 1,
      originalError: lastError?.message,
    },
  );
};

const uploadToCloudStorage = async (params: UploadParams): Promise<string> => {
  const { buffer, fileName, subdomain, logger } = params;

  logger.debug('Uploading to cloud storage', {
    fileName,
    subdomain,
    bufferSize: buffer.length,
    pid: process.pid,
  });

  try {
    const uploadUrl = getUrl(subdomain);
    const sanitizedFileName = sanitizeFileName(fileName);
    const formData = createFormData(buffer, sanitizedFileName);

    // Create AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      CONFIG.UPLOAD.TIMEOUT,
    );

    const uploadResponse: Response = await fetch(uploadUrl, {
      method: CONFIG.UPLOAD.METHOD,
      body: formData as any, // FormData type compatibility
      signal: controller.signal,
      headers: formData.getHeaders(),
    });

    clearTimeout(timeoutId);

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse
        .text()
        .catch(() => 'Unknown error');
      throw new RecordUrlError(
        `Upload failed with status ${uploadResponse.status}: ${errorText}`,
        ErrorCodes.UPLOAD_HTTP_ERROR,
        {
          status: uploadResponse.status,
          statusText: uploadResponse.statusText,
          fileName: sanitizedFileName,
          uploadUrl,
          errorResponse: errorText,
        },
      );
    }

    const responseText = await uploadResponse.text();

    logger.debug('Upload completed successfully', {
      fileName: sanitizedFileName,
      responseLength: responseText.length,
      status: uploadResponse.status,
    });

    return responseText;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new RecordUrlError(
        'Upload timeout exceeded',
        ErrorCodes.UPLOAD_TIMEOUT,
        { fileName, timeout: CONFIG.UPLOAD.TIMEOUT },
      );
    }

    if (error instanceof RecordUrlError) throw error;

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    const errorCode =
      error instanceof Error && 'code' in error
        ? (error as any).code
        : undefined;

    throw new RecordUrlError(
      'Failed to upload file to cloud storage',
      ErrorCodes.UPLOAD_ERROR,
      {
        fileName,
        subdomain,
        originalError: errorMessage,
        errorCode,
      },
    );
  }
};

const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(
      CONFIG.FILE.SANITIZATION_PATTERN,
      CONFIG.FILE.SANITIZATION_REPLACEMENT,
    )
    .replace(/[^\w\-_.]/g, '_') // Additional sanitization for Node.js filesystem
    .substring(0, CONFIG.FILE.MAX_FILENAME_LENGTH);
};

const createFormData = (buffer: Buffer, fileName: string): FormData => {
  const formData = new FormData();
  formData.append('file', buffer, {
    filename: fileName,
    contentType: CONFIG.UPLOAD.CONTENT_TYPE,
  });
  return formData;
};

const createLogger = (context: string): Logger => {
  const createLogMessage = (
    level: string,
    message: string,
    meta: Record<string, any> = {},
  ): LogData => {
    const timestamp = new Date().toISOString();
    return {
      timestamp,
      level,
      context,
      message,
      pid: process.pid,
      ...meta,
    };
  };

  return {
    info: (message: string, meta: Record<string, any> = {}) =>
      console.info(JSON.stringify(createLogMessage('INFO', message, meta))),
    debug: (message: string, meta: Record<string, any> = {}) =>
      console.debug(JSON.stringify(createLogMessage('DEBUG', message, meta))),
    error: (message: string, meta: Record<string, any> = {}) =>
      console.error(JSON.stringify(createLogMessage('ERROR', message, meta))),
    warn: (message: string, meta: Record<string, any> = {}) =>
      console.warn(JSON.stringify(createLogMessage('WARN', message, meta))),
  };
};

const sanitizeLogParams = (
  params: CfRecordUrlParams,
): Partial<CfRecordUrlParams> => {
  const { inboxIntegrationId, ...safeParams } = params;
  return {
    ...safeParams,
    inboxIntegrationId: inboxIntegrationId ? '[REDACTED]' : undefined,
  };
};

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export type { CfRecordUrlParams, Logger, ErrorDetails };

export { RecordUrlError, ErrorCodes };
