import * as AWS from 'aws-sdk';
import { getConfig } from 'erxes-api-shared/core-modules';
import * as nodemailer from 'nodemailer';

export const createTransporter = async ({ ses }) => {
  if (ses) {
    const AWS_SES_ACCESS_KEY_ID = await getConfig('AWS_SES_ACCESS_KEY_ID');

    const AWS_SES_SECRET_ACCESS_KEY = await getConfig(
      'AWS_SES_SECRET_ACCESS_KEY',
    );
    const AWS_REGION = await getConfig('AWS_REGION');

    AWS.config.update({
      region: AWS_REGION,
      accessKeyId: AWS_SES_ACCESS_KEY_ID,
      secretAccessKey: AWS_SES_SECRET_ACCESS_KEY,
    });

    return nodemailer.createTransport({
      SES: new AWS.SES({ apiVersion: '2010-12-01' }),
    });
  }

  const MAIL_SERVICE = await getConfig('MAIL_SERVICE', '');
  const MAIL_PORT = await getConfig('MAIL_PORT', '');
  const MAIL_USER = await getConfig('MAIL_USER', '');
  const MAIL_PASS = await getConfig('MAIL_PASS', '');
  const MAIL_HOST = await getConfig('MAIL_HOST', '');

  let auth;

  if (MAIL_USER && MAIL_PASS) {
    auth = {
      user: MAIL_USER,
      pass: MAIL_PASS,
    };
  }

  return nodemailer.createTransport({
    service: MAIL_SERVICE,
    host: MAIL_HOST,
    port: MAIL_PORT,
    auth,
  });
};
