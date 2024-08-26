import { chunkArray } from "./core";
import { Transform } from "stream";

export const stream = async (
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

  const chldCursor = generateChildStream().cursor();

  try {
    for await (const doc of chldCursor) {
      parentTransformerStream.write(doc);
    }
    parentTransformerStream.end();

    await onFinishPiping();
    return "done";
  } catch (error) {
    parentTransformerStream.destroy();
    throw error;
  } finally {
    await chldCursor.close();
  }
};
