import { chunkArray } from './utils';
import { Readable, Transform } from 'stream';

export const stream = async <T>(
  executeChunk: (chunk: T[]) => Promise<void>,
  transformCallback: (variables: { parentIds?: T[] }, root: T) => void,
  generateChildStream: () => { cursor: () => Readable },
  chunkSize: number,
): Promise<'done'> => {
  const variables: { parentIds?: T[] } = {};

  // Function to handle remaining items after streaming
  const onFinishPiping = async () => {
    if (variables.parentIds && variables.parentIds.length > 0) {
      const chunks = chunkArray(variables.parentIds, chunkSize);
      for (const chunk of chunks) {
        await executeChunk(chunk);
      }
    }
  };

  // Transformer stream to process each item
  const parentTransformerStream = new Transform({
    objectMode: true,
    transform(root: unknown, _encoding, callback) {
      try {
        transformCallback(variables, root as T);
        callback();
      } catch (err) {
        callback(err as Error);
      }
    },
  });

  const childCursor = generateChildStream().cursor();

  try {
    await new Promise<void>((resolve, reject) => {
      childCursor.pipe(parentTransformerStream);

      parentTransformerStream.on('finish', async () => {
        try {
          await onFinishPiping();
          resolve();
        } catch (err) {
          reject(err);
        }
      });

      parentTransformerStream.on('error', reject);
    });

    return 'done';
  } catch (error) {
    parentTransformerStream.destroy();
    throw error;
  } finally {
    if (typeof childCursor.destroy === 'function') {
      childCursor.destroy();
    }
  }
};
