import mongoose from 'mongoose';
import { sendWorkerQueue } from '../mq-worker';
const activeStreams = new Map<string, any>();

// Add a cleanup function to properly close all streams when needed
export const cleanupChangeStreams = () => {
  if (!activeStreams.size) {
    return;
  }

  activeStreams.forEach((stream, modelName) => {
    console.log(`Closing change stream for model: ${modelName}`);
    try {
      stream.close();
    } catch (error) {
      console.error(
        `Failed to close change stream for model ${modelName}:`,
        error,
      );
    }
  });
  activeStreams.clear();
};

export const startChangeStreams = (
  models: Record<string, mongoose.Model<any>>,
  subdomain: string,
  logIgnoreOptions?: {
    ignoreChangeStream?: boolean;
    ignoreModels?: string[];
  },
) => {
  for (const [_, model] of Object.entries(models)) {
    const { modelName } = model;
    // Skip if already watching this model
    if (activeStreams.has(modelName)) continue;

    if ((logIgnoreOptions?.ignoreModels || []).includes(modelName)) {
      continue;
    }

    const changeStream = model.watch([], {
      fullDocument: 'updateLookup',
    });

    // Store reference
    activeStreams.set(modelName, changeStream);
    const contentType = (model.schema.statics as any)._contentType;

    changeStream.on('change', (change) => {
      // Send to your worker queue
      sendWorkerQueue('logs', 'put_log').add('put_log', {
        subdomain,
        source: 'mongo',
        status: 'success',
        contentType,
        payload: change,
      });
    });

    changeStream.on('error', (err) => {
      console.error(`Change stream error for ${modelName}:`, err);
      activeStreams.delete(modelName);
    });

    changeStream.on('close', () => {
      console.log(`Change stream closed for ${modelName}`);
      activeStreams.delete(modelName);
    });
  }
};
