import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getEnv } from 'erxes-api-shared/utils';

let s3: S3Client | null = null;

const getS3Client = () => {
  if (!s3) {
    const endpoint = getEnv({ name: 'R2_ENDPOINT' });
    const accessKeyId = getEnv({ name: 'R2_ACCESS_KEY_ID' });
    const secretAccessKey = getEnv({ name: 'R2_SECRET_ACCESS_KEY' });

    s3 = new S3Client({
      region: 'auto',
      endpoint,
      credentials: { accessKeyId, secretAccessKey },
    });
  }
  return s3;
};

export const getFileAsStringFromCF = async (bucket: string, key: string) => {
  const s3Client = getS3Client();
  const res = await s3Client
    .send(new GetObjectCommand({ Bucket: bucket, Key: key }))
    .catch((error) => {
      throw error;
    });

  if (!res.Body) {
    throw new Error('No body returned from S3 object');
  }

  const rawContent = await res.Body.transformToString();
  return rawContent;
};

export const getFileAsBufferFromCF = async (bucket: string, key: string) => {
  const s3Client = getS3Client();
  const res = await s3Client
    .send(new GetObjectCommand({ Bucket: bucket, Key: key }))
    .catch((error) => {
      throw error;
    });

  if (!res.Body) {
    throw new Error('No body returned from S3 object');
  }

  // @ts-ignore aws v3 stream helper
  const bytes = await res.Body.transformToByteArray();
  return Buffer.from(bytes);
};

export function chunkText(text: string, maxLength = 1000): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    chunks.push(text.slice(start, start + maxLength));
    start += maxLength;
  }

  return chunks;
}
