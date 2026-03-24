import crypto from 'crypto';
import { getSubdomain } from 'erxes-api-shared/utils';
import { Request, Response, Router } from 'express';
import { generateModels } from '~/connectionResolvers';

const router: Router = Router();

const encryptData = (data: any, key: string): string => {
  const algorithm = 'aes-256-gcm';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(algorithm, key);

  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return JSON.stringify({
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  });
};

const decryptData = (encryptedData: string, key: string): any => {
  const algorithm = 'aes-256-gcm';
  const { encrypted, iv, authTag } = JSON.parse(encryptedData);

  const decipher = crypto.createDecipher(algorithm, key);
  decipher.setAuthTag(new Uint8Array(Buffer.from(authTag, 'hex')));

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return JSON.parse(decrypted);
};

router.get(
  '/export/template/:templateId',
  async (req: Request, res: Response) => {
    const { templateId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'Not authenticated' });
    }

    const subdomain = getSubdomain(req);

    const models = await generateModels(subdomain);

    const user = await models.Users.findOne({ _id: userId });

    if (!user) {
      return res.status(400).json({ error: 'Not authenticated' });
    }

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

    const sanitizedName = template.name
      .replace(/[^a-zA-Z0-9\s-_]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);

    const fileName = `${sanitizedName}.json`;

    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Content-Security-Policy', "default-src 'none'");

    res.attachment(fileName);
    res.setHeader('Content-Type', 'application/json');

    const encryptionKey =
      process.env.TEMPLATE_EXPORT_KEY || 'default-key-change-in-production';

    const encryptedData = encryptData(template, encryptionKey);

    return res.send(encryptedData);
  },
);

router.post('/import/template', async (req: Request, res: Response) => {
  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);

  try {
    const { encryptedData, encryptionKey, userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Not authenticated' });
    }

    const user = await models.Users.findOne({ _id: userId });

    if (!user) {
      return res.status(400).json({ error: 'Not authenticated' });
    }

    if (!encryptedData) {
      return res.status(400).json({ error: 'Encrypted data is required' });
    }

    const key =
      encryptionKey ||
      process.env.TEMPLATE_EXPORT_KEY ||
      'default-key-change-in-production';

    const templateData = decryptData(encryptedData, key);

    const document = {
      ...templateData,
      createdBy: userId,
    };

    delete document._id;

    await models.Template.create(document);

    res.status(201).json({
      success: true,
      message: 'Template imported successfully',
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to import template',
      details: error.message,
    });
  }
});

export { router };
