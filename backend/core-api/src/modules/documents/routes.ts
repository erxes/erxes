import { getSubdomain } from 'erxes-api-shared/utils';
import { NextFunction, Request, Response, Router } from 'express';
import { z } from 'zod';
import { generateModels } from '~/connectionResolvers';

const router: Router = Router();
const printQuerySchema = z.object({
  _id: z.string().min(1),
  config: z.record(z.unknown()).optional(),
  replacerIds: z.union([z.string(), z.array(z.string())]).optional(),
});

router.get(
  '/print',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const subdomain = getSubdomain(req);
      const models = await generateModels(subdomain);
      const { _id, config, replacerIds } = printQuerySchema.parse(req.query);

      // This legacy route has no authenticated user. The model denies locked
      // documents; authenticated printing goes through documentsProcess.
      const content = await models.Documents.processDocument({
        _id,
        config,
        replacerIds:
          typeof replacerIds === 'string' ? [replacerIds] : replacerIds,
      });

      res.send(content);
    } catch (error) {
      next(error);
    }
  },
);

export { router };
