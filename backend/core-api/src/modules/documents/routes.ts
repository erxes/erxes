import { getSubdomain } from 'erxes-api-shared/utils';
import { Request, Response, Router } from 'express';
import { generateModels } from '~/connectionResolvers';

const router: Router = Router();

router.get('/print', async (req: Request, res: Response) => {
  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);

  const { _id, config, replacerIds } = req.query;

  const document = await models.Documents.processDocument({
    _id,
    config,
    replacerIds,
  });

  return res.send(document.content);
});

export { router };
