import { getEnv } from '@erxes/api-utils/src';
import * as formidable from 'formidable';
import { generateModels } from '../connectionResolver';
import * as _ from 'underscore';
import { filterXSS } from 'xss';

import { checkFile, resizeImage, uploadFile } from '../data/utils';
import { isImage } from "@erxes/api-utils/src/commonUtils";
import { getSubdomain } from '@erxes/api-utils/src/core';

const DOMAIN = getEnv({ name: 'DOMAIN' });

export const uploader = async (req: any, res, next) => {
  const subdomain = getSubdomain(req);
  const domain = DOMAIN.replace('<subdomain>', subdomain);
  const models = await generateModels(subdomain);

  const maxHeight = Number(req.query.maxHeight);
  const maxWidth = Number(req.query.maxWidth);

  const form = new formidable.IncomingForm();

  form.parse(req, async (_error, _fields, response) => {
    const file: any = response.file || response.upload;

    let fileResult = file;

    const mimetype = file.type || file.mime;

    if (!mimetype) {
      return res.status(500).send('File type is not recognized');
    }

    if (isImage(mimetype) && maxHeight && maxWidth) {
      fileResult = await resizeImage(file, maxWidth, maxHeight);
    }

    // check file ====
    const status = await checkFile(models, fileResult, req.headers.source);
    if (status === 'ok') {
      try {
        const result = await uploadFile(
          `${domain}/gateway`,
          fileResult,
          response.upload ? true : false,
          models,
        );

        return res.send(result);
      } catch (e) {
        return res.status(500).send(filterXSS(e.message));
      }
    }

    return res.status(500).send(status);
  });
};
