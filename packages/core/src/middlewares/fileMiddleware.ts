import { getEnv } from '@erxes/api-utils/src';
import * as formidable from 'formidable';
import * as request from 'request';
import { generateModels } from '../connectionResolver';
import * as _ from 'underscore';
import * as fileType from 'file-type';
import * as fs from 'fs';
import { filterXSS } from 'xss';

import { checkFile, resizeImage, uploadFile } from '../data/utils';
import { debugExternalApi } from '../debuggers';
import { getSubdomain } from '@erxes/api-utils/src/core';

const DOMAIN = getEnv({ name: 'DOMAIN' });

export const uploader = async (req: any, res, next) => {
  const subdomain = getSubdomain(req);
  const domain = DOMAIN.replace('<subdomain>', subdomain);
  const models = await generateModels(subdomain);

  const maxHeight = Number(req.query.maxHeight);
  const maxWidth = Number(req.query.maxWidth);

  const INTEGRATIONS_API_DOMAIN = `${domain}/gateway/pl:integrations`;

  if (req.query.kind === 'nylas') {
    debugExternalApi(`Pipeing request to ${INTEGRATIONS_API_DOMAIN}`);

    return req.pipe(
      request
        .post(`${INTEGRATIONS_API_DOMAIN}/nylas/upload`)
        .on('response', response => {
          if (response.statusCode !== 200) {
            return next(new Error(response.statusMessage));
          }

          return response.pipe(res);
        })
        .on('error', e => {
          debugExternalApi(`Error from pipe ${e.message}`);

          return next(e);
        })
    );
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (_error, _fields, response) => {
    const file: any = response.file || response.upload;

    let fileResult = file;

    const detectedType = fileType(fs.readFileSync(file.path));
    if (detectedType && detectedType.mime.startsWith('image/')) {
      if (maxHeight || maxWidth) {
        fileResult = await resizeImage(file, maxWidth, maxHeight);
      }
    }

    // check file ====
    const status = await checkFile(models, fileResult, req.headers.source);
    if (status === 'ok') {
      try {
        const result = await uploadFile(
          `${domain}/gateway`,
          fileResult,
          response.upload ? true : false,
          models
        );

        return res.send(result);
      } catch (e) {
        return res.status(500).send(filterXSS(e.message));
      }
    }

    return res.status(500).send(status);
  });
};
