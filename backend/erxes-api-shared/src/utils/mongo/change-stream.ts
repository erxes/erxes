import mongoose from 'mongoose';
import { sendWorkerQueue } from '../mq-worker';
import { redis } from '../redis';

// Track streams by subdomain:modelName to support multi-tenant
const activeStreams = new Map<string, any>();

// Helper functions for resume token management
const getResumeTokenKey = (subdomain: string, modelName: string): string => {
  return `changeStream:resumeToken:${subdomain}:${modelName}`;
};

const getResumeToken = async (
  subdomain: string,
  modelName: string,
): Promise<any | null> => {
  try {
    const tokenData = await redis.get(getResumeTokenKey(subdomain, modelName));
    return tokenData ? JSON.parse(tokenData) : null;
  } catch (error) {
    console.error(
      `Failed to get resume token for ${subdomain}:${modelName}:`,
      error,
    );
    return null;
  }
};

const saveResumeToken = async (
  subdomain: string,
  modelName: string,
  token: any,
): Promise<void> => {
  try {
    await redis.set(
      getResumeTokenKey(subdomain, modelName),
      JSON.stringify(token),
    );
  } catch (error) {
    console.error(
      `Failed to save resume token for ${subdomain}:${modelName}:`,
      error,
    );
  }
};

// Add a cleanup function to properly close all streams when needed
export const cleanupChangeStreams = () => {
  if (!activeStreams.size) {
    return;
  }

  activeStreams.forEach((stream, streamKey) => {
    console.log(`Closing change stream: ${streamKey}`);
    try {
      stream.close();
    } catch (error) {
      console.error(`Failed to close change stream ${streamKey}:`, error);
    }
  });
  activeStreams.clear();
};

// Cleanup streams for a specific subdomain
export const cleanupChangeStreamsForSubdomain = async (
  subdomain: string,
): Promise<void> => {
  const keysToDelete: string[] = [];

  activeStreams.forEach((stream, streamKey) => {
    if (streamKey.startsWith(`${subdomain}:`)) {
      keysToDelete.push(streamKey);
      try {
        stream.close();
      } catch (error) {
        console.error(`Failed to close change stream ${streamKey}:`, error);
      }
    }
  });

  keysToDelete.forEach((key) => activeStreams.delete(key));

  try {
    const pattern = getResumeTokenKey(subdomain, '*');
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error(`Failed to cleanup resume tokens for ${subdomain}:`, error);
  }
};

export const startChangeStreams = async (
  models: Record<string, mongoose.Model<any>>,
  subdomain: string,
  logIgnoreOptions?: {
    ignoreChangeStream?: boolean;
    ignoreModels?: string[];
  },
): Promise<void> => {
  for (const [_, model] of Object.entries(models)) {
    const { modelName } = model;

    // Use subdomain:modelName as key to support multiple subdomains
    const streamKey = `${subdomain}:${modelName}`;

    // Skip if already watching this model for this subdomain
    if (activeStreams.has(streamKey)) continue;

    if ((logIgnoreOptions?.ignoreModels || []).includes(modelName)) {
      continue;
    }

    // Get saved resume token to resume from last position
    const lastResumeToken = await getResumeToken(subdomain, modelName);

    // Build watch options with resume token if available
    const watchOptions: mongoose.mongo.ChangeStreamOptions = {
      fullDocument: 'updateLookup',
    };

    if (lastResumeToken) {
      watchOptions.resumeAfter = lastResumeToken;
      console.log(
        `Resuming change stream for ${streamKey} from saved position`,
      );
    }

    const changeStream = model.watch([], watchOptions);

    // Store reference with subdomain prefix
    activeStreams.set(streamKey, changeStream);
    const contentType = (model.schema.statics as any)._contentType;

    changeStream.on('change', async (change) => {
      // Save resume token after each change event for fault tolerance
      if (change._id) {
        await saveResumeToken(subdomain, modelName, change._id);
      }

      // Send to your worker queue
      sendWorkerQueue('logs', 'put_log').add('put_log', {
        subdomain,
        source: 'mongo',
        status: 'success',
        contentType,
        payload: change,
      });
    });

    changeStream.on('error', async (err) => {
      console.error(`Change stream error for ${streamKey}:`, err);
      activeStreams.delete(streamKey);
      // Note: Resume token is preserved, so stream can be restarted
      // from last successful position
    });

    changeStream.on('close', () => {
      console.log(`Change stream closed for ${streamKey}`);
      activeStreams.delete(streamKey);
      // Note: Resume token is preserved for potential restart
    });
  }
};
