import { Transform } from 'stream';
import { chunkArray } from './core';

export const stream = (
  executeChunk,
  transformCallback,
  generateChildStream,
  chunkSize
) => {
  const variables: any = {};

  const onFinishPiping = async () => {
    if (variables.parentIds) {
      const chunks = chunkArray(variables.parentIds, chunkSize);

      if (chunks.length) {
        for (const chunk of chunks) {
          await executeChunk(chunk);
        }
      }
    }
  };

  const parentTransformerStream = new Transform({
    objectMode: true,

    transform(root, _encoding, callback) {
      transformCallback(variables, root);

      callback();
    }
  });

  const chldStream = generateChildStream().stream();

  return new Promise((resolve, reject) => {
    const pipe = chldStream.pipe(parentTransformerStream);

    pipe.on('finish', async () => {
      try {
        await onFinishPiping();
      } catch (e) {
        return reject(e);
      }

      resolve('done');
    });
  });
};
