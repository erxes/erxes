import { getSubdomain } from 'erxes-api-shared/utils';
import { Request, Response, Router } from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { generateModels } from '~/connectionResolvers';
import { canServeInline } from '@/files/utils/mime';
import {
  renderShareErrorPage,
  renderShareGonePage,
  renderSharePage,
  TShareLang,
} from '@/files/utils/sharePage';

export const router: Router = Router();

const shareLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  keyGenerator: (req) => ipKeyGenerator(req.ip || 'unknown'),
  standardHeaders: true,
  legacyHeaders: false,
});

const PAGE_HEADERS = {
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex',
  'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; img-src data:",
  'Referrer-Policy': 'no-referrer',
};

const langOf = (req: Request): TShareLang =>
  req.acceptsLanguages('mn', 'en') === 'mn' ? 'mn' : 'en';

router.get('/files/s/:token', shareLimiter, async (req: Request, res: Response) => {
  try {
    const models = await generateModels(getSubdomain(req));
    const share = await models.FileShares.resolveToken(req.params.token);
    const file = await models.Files.getFile(share.fileId);
    const download = req.query.download === '1';

    if (download || canServeInline(file.mimeType)) {
      res.setHeader('Cache-Control', 'no-store');

      return res.redirect(
        302,
        await models.Files.getSharedFileUrl(file._id, { attachment: download }),
      );
    }

    res.set(PAGE_HEADERS);

    return res.send(
      renderSharePage({
        name: file.name,
        size: file.size,
        mimeType: file.mimeType,
        ext: file.ext,
        downloadUrl: '?download=1',
        lang: langOf(req),
      }),
    );
  } catch (e) {
    res.set(PAGE_HEADERS);

    if ((e as { isExpected?: boolean }).isExpected) {
      return res.status(404).send(renderShareGonePage(langOf(req)));
    }

    console.error('Files share link failed:', e);

    return res.status(503).send(renderShareErrorPage(langOf(req)));
  }
});
