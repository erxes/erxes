import { Transform } from 'stream';
import { chunkArray } from './utils';

export const stream = (
  executeChunk,
  transformCallback,
  generateChildStream,
  chunkSize
) => {
  const variables: any = {};

  const onFinishPiping = async () => {
    const chunks = chunkArray(variables.parentIds, chunkSize);

    for (const chunk of chunks) {
      executeChunk(chunk);
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
