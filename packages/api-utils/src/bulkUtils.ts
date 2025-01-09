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

  const childCursor = generateChildStream().cursor();

  try {
    // Process the stream and wait for it to finish
    await new Promise<void>((resolve, reject) => {
      childCursor.pipe(parentTransformerStream);

      // Resolve the promise when the stream finishes processing
      parentTransformerStream.on("finish", async () => {
        await onFinishPiping();
        resolve();
      });

      // Reject the promise if there is an error
      parentTransformerStream.on("error", error => {
        reject(error);
      });
    });

    return "done";
  } catch (error) {
    parentTransformerStream.destroy();
    throw error;
  } finally {
    await childCursor.close();
  }
};
