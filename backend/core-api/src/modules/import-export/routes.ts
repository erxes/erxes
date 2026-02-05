import { Router } from 'express';
import { importTemplates } from '~/modules/import-export/trpc/templates';

const router: Router = Router();

router.get('/import-export/download-template', (req, res) => {
  const entityType = req.query.entityType as string;

  if (!entityType) {
    return res.status(400).send('entityType is required');
  }

  const tpl =
    importTemplates[entityType] ?? {
      filename: 'import-template.csv',
      headers: [],
    };

  const csv = `${tpl.headers.join(',')}\n`;

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${tpl.filename}"`,
  );

  res.status(200).send(csv);
});

export{ router };
