import { getEnv } from '@erxes/api-utils/src';
import * as formidable from 'formidable';
import * as _ from 'underscore';
import { filterXSS } from 'xss';
import * as tmp from 'tmp';

import { getSubdomain } from '@erxes/api-utils/src/core';
import { generateModels } from './connectionResolver';
import { checkPermission, handleUpload } from './utils';



export const uploader = async (req: any, res, next) => {
  console.log("111111")
  const subdomain = getSubdomain(req);
console.log("222222", subdomain)
  if (!req.user) {
    return res.status(401).send('Unauthorized');
  }

  try {
    console.log("3333333")
    await checkPermission(subdomain, req.user, 'manageKnowledgeBase');
    console.log("4444444")
    const form = new formidable.IncomingForm();

    form.parse(req, async (_error, _fields, response) => {
      const file: any = response.file || response.upload;
        console.log(file)
      const mimetype = file.type || file.mime;

      if (!mimetype) {
        return res.status(500).send('File type is not recognized');
      }

      // if file is not pdf throw error
      if (mimetype !== 'application/pdf') {
        return res.status(500).send('Only PDF files are allowed!');
      }

      const files = await handleUpload(subdomain, file);

      tmp.setGracefulCleanup();
      res.status(200).json({ success: true, ...files });
    });
  } catch (error) {
    tmp.setGracefulCleanup();
    return res.status(500).send(error.message);
  }
};
