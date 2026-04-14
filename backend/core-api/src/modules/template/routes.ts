import crypto from 'crypto';
import { extractUserFromHeader, getSubdomain } from 'erxes-api-shared/utils';
import { Request, Response, Router } from 'express';
import { generateModels } from '~/connectionResolvers';

const router: Router = Router();

const ALGORITHM = 'aes-256-gcm';

/** Reads and validates the TEMPLATE_EXPORT_KEY environment variable. */
const getEncryptionKey = (): string => {
  const key = process.env.TEMPLATE_EXPORT_KEY;
  if (!key) {
    throw new Error(
      'TEMPLATE_EXPORT_KEY environment variable is not configured',
    );
  }
  return key;
};

/** Derives a 32-byte AES-256 key from a passphrase using SHA-256. */
const deriveKey = (key: string): Buffer => {
  return crypto.createHash('sha256').update(key).digest();
};

/** Extracts authenticated user from request headers. Returns null and sends 401 on failure. */
const authenticateRequest = (
  req: Request,
  res: Response,
): { _id: string } | null => {
  let user: unknown;
  try {
    user = extractUserFromHeader(req.headers);
  } catch {
    res.status(401).json({ error: 'Not authenticated' });
    return null;
  }

  const typed = user as { _id?: string } | null;

  if (!typed || !typed._id) {
    res.status(401).json({ error: 'Not authenticated' });
    return null;
  }

  return typed as { _id: string };
};

/** Encrypts template data with AES-256-GCM and returns a versioned JSON envelope. */
const encryptData = (data: Record<string, unknown>, key: string): string => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, deriveKey(key), iv);

  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return JSON.stringify({
    version: 2,
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  });
};

/** Decrypts a versioned JSON envelope. Rejects payloads from older format versions. */
const decryptData = (encryptedData: string, key: string): Record<string, unknown> => {
  const parsed = JSON.parse(encryptedData);

  if (!parsed.version || parsed.version < 2) {
    throw new Error(
      'This file was exported with an older format that is no longer supported. Please re-export the template and try again.',
    );
  }

  const { encrypted, iv, authTag } = parsed;

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    deriveKey(key),
    Buffer.from(iv, 'hex'),
  );
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return JSON.parse(decrypted);
};

router.get(
  '/export/template/:templateId',
  async (req: Request, res: Response) => {
    const user = authenticateRequest(req, res);
    if (!user) return null;

    try {
      const { templateId } = req.params;
      const subdomain = getSubdomain(req);
      const models = await generateModels(subdomain);

      const template = await models.Template.findOne(
        { _id: templateId },
        {
          _id: 0,
          name: 1,
          description: 1,
          contentType: 1,
          content: 1,
          relatedContents: 1,
        },
      ).lean();

      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      const sanitizedName =
        template.name
          .replace(/[^a-zA-Z0-9\s_-]/g, '')
          .replace(/\s+/g, '_')
          .substring(0, 50) || 'template';

      const fileName = `${sanitizedName}.json`;

      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('Content-Security-Policy', "default-src 'none'");

      res.attachment(fileName);
      res.setHeader('Content-Type', 'application/json');

      const encryptionKey = getEncryptionKey();
      const encryptedData = encryptData(template, encryptionKey);

      return res.send(encryptedData);
    } catch (_err) {
      return res.status(500).json({ error: 'Failed to export template' });
    }
  },
);

router.post('/import/template', async (req: Request, res: Response) => {
  const user = authenticateRequest(req, res);
  if (!user) return null;

  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);

  try {
    const { encryptedData } = req.body;

    if (!encryptedData) {
      return res.status(400).json({ error: 'Encrypted data is required' });
    }

    const encryptionKey = getEncryptionKey();
    const templateData = decryptData(encryptedData, encryptionKey);

    const { name, description, contentType, content, relatedContents } =
      templateData;

    const document = {
      name,
      description,
      contentType,
      content,
      relatedContents,
      createdBy: user._id,
    };

    await models.Template.create(document);

    return res.status(201).json({
      success: true,
      message: 'Template imported successfully',
    });
  } catch (err) {
    const isClientError =
      err instanceof Error && err.message.includes('older format');

    return res
      .status(isClientError ? 400 : 500)
      .json({ error: isClientError ? err.message : 'Failed to import template' });
  }
});

export { router };
