import { GraphQLError } from 'graphql';
import { createHash, randomUUID } from 'node:crypto';
import { Router } from 'express';
import type { Request, Response } from 'express';
import { S3 } from 'aws-sdk';
import { z } from 'zod';
import { requireMessagingActor, type MessagingActor } from './auth';
import { requireThread } from './conversations';
import { messagingError, messagingNotFound } from './errors';
import type { MessagingApp } from './config';

const credentialsSchema = z.object({
  accessKeyId: z.string().min(1),
  secretAccessKey: z.string().min(1),
  sessionToken: z.string().optional(),
});

export const messagingStorage = (app: MessagingApp) => {
  if (!app.storage)
    throw messagingError('Attachments are disabled', 'FORBIDDEN');
  const credentials = credentialsSchema.parse(
    JSON.parse(process.env[app.storage.credentialEnv] || '{}'),
  );
  return new S3({
    region: app.storage.region,
    endpoint: app.storage.endpoint,
    s3ForcePathStyle: Boolean(app.storage.endpoint),
    credentials,
    signatureVersion: 'v4',
    maxRetries: 2,
    httpOptions: { timeout: 20000, connectTimeout: 5000 },
  });
};

export const identifyAttachmentMime = (bytes: Buffer): string | null => {
  if (
    bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  )
    return 'image/png';
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
    return 'image/jpeg';
  if (['GIF87a', 'GIF89a'].includes(bytes.subarray(0, 6).toString('ascii')))
    return 'image/gif';
  if (bytes.subarray(0, 5).toString('ascii') === '%PDF-')
    return 'application/pdf';
  return null;
};

export const prepareAttachment = async (
  actor: MessagingActor,
  input: {
    conversationId: string;
    name: string;
    mimeType: string;
    size: number;
  },
) => {
  const { app, models, scope, member } = actor;
  await requireThread(actor, input.conversationId);
  const policy = app.storage;
  if (!policy) throw messagingError('Attachments are disabled', 'FORBIDDEN');
  const name = input.name.trim();
  if (
    !name ||
    name.length > 200 ||
    !Number.isInteger(input.size) ||
    input.size < 1 ||
    input.size > policy.maxBytes ||
    !policy.mimeTypes.some((mime) => mime === input.mimeType)
  ) {
    throw messagingError('Attachment exceeds the app file policy');
  }
  // Separate object credentials keep the legacy file endpoints outside this store.
  const prefix = createHash('sha256')
    .update(JSON.stringify([scope.tenant, scope.appId]))
    .digest('hex');
  const attachment = await models.Attachments.create({
    ...scope,
    ...input,
    name,
    ownerId: member._id,
    objectKey: prefix + '/' + randomUUID(),
    expiresAt: new Date(Date.now() + 15 * 60_000),
  });
  return {
    id: attachment._id,
    uploadPath: '/pl:frontline/messaging/attachments/' + attachment._id,
  };
};

const uploadAttachment = async (req: Request, res: Response) => {
  const actor = await requireMessagingActor({ req });
  const { app, models, scope } = actor;
  const attachment = await models.Attachments.findOne({
    ...scope,
    _id: req.params.id,
    ownerId: actor.member._id,
    state: 'PENDING',
    expiresAt: { $gt: new Date() },
  }).lean();
  if (!attachment || !app.storage) throw messagingNotFound();
  await requireThread(actor, attachment.conversationId);
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    if (!Buffer.isBuffer(chunk)) throw messagingError('Invalid upload body');
    size += chunk.length;
    if (size > attachment.size || size > app.storage.maxBytes)
      throw messagingError('Attachment too large');
    chunks.push(chunk);
  }
  const bytes = Buffer.concat(chunks);
  if (
    size !== attachment.size ||
    identifyAttachmentMime(bytes) !== attachment.mimeType
  ) {
    throw messagingError('Attachment size or file type does not match');
  }
  await requireThread(actor, attachment.conversationId);
  const claimed = await models.Attachments.updateOne(
    {
      ...scope,
      _id: attachment._id,
      state: 'PENDING',
      expiresAt: { $gt: new Date() },
    },
    { $set: { state: 'UPLOADING' } },
  );
  if (!claimed.modifiedCount) throw messagingNotFound();
  try {
    await messagingStorage(app)
      .putObject({
        Bucket: app.storage.bucket,
        Key: attachment.objectKey,
        Body: bytes,
        ContentType: attachment.mimeType,
        ServerSideEncryption: 'AES256',
      })
      .promise();
    await models.Attachments.updateOne(
      { ...scope, _id: attachment._id, state: 'UPLOADING' },
      { $set: { state: 'READY', expiresAt: new Date(Date.now() + 86400_000) } },
    );
  } catch (error) {
    await models.Attachments.updateOne(
      { ...scope, _id: attachment._id, state: 'UPLOADING' },
      { $set: { state: 'PENDING' } },
    );
    throw error;
  }
  res.json({ id: attachment._id });
};

const downloadAttachment = async (req: Request, res: Response) => {
  const actor = await requireMessagingActor({ req });
  const attachment = await actor.models.Attachments.findOne({
    ...actor.scope,
    _id: req.params.id,
    state: 'BOUND',
  }).lean();
  if (!attachment || !actor.app.storage) throw messagingNotFound();
  const { membership } = await requireThread(actor, attachment.conversationId);
  const message = await actor.models.Messages.exists({
    ...actor.scope,
    conversationId: attachment.conversationId,
    attachmentIds: attachment._id,
    sequence: { $gte: membership.joinedSequence },
  });
  if (!message) throw messagingNotFound();
  const response = await messagingStorage(actor.app)
    .getObject({
      Bucket: actor.app.storage.bucket,
      Key: attachment.objectKey,
    })
    .promise();
  if (!Buffer.isBuffer(response.Body))
    throw messagingError('File unavailable', 'INTERNAL_SERVER_ERROR');
  // Revalidate after the external read, including a concurrent group removal.
  const current = await requireThread(actor, attachment.conversationId);
  const stillVisible = await actor.models.Messages.exists({
    ...actor.scope,
    conversationId: attachment.conversationId,
    attachmentIds: attachment._id,
    sequence: { $gte: current.membership.joinedSequence },
  });
  if (!stillVisible) throw messagingNotFound();
  res.set({
    'Content-Type': attachment.mimeType,
    'Content-Disposition':
      "attachment; filename*=UTF-8''" +
      encodeURIComponent(attachment.name).replace(
        /['()*]/g,
        (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase(),
      ),
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  res.send(response.Body);
};

export const messagingAttachmentRouter: Router = Router();
const route =
  (handler: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response) => {
    void handler(req, res).catch((error: unknown) => {
      if (res.headersSent) return;
      if (error instanceof GraphQLError) {
        if (error.extensions.code === 'BAD_USER_INPUT') {
          res.status(400).json({ error: error.message });
          return;
        }
        res.status(404).json({ error: 'Attachment unavailable' });
        return;
      }
      res.status(503).json({ error: 'Attachment storage unavailable' });
    });
  };
messagingAttachmentRouter.put(
  '/messaging/attachments/:id',
  route(uploadAttachment),
);
messagingAttachmentRouter.get(
  '/messaging/attachments/:id',
  route(downloadAttachment),
);
