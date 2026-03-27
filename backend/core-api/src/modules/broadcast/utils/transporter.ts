import * as AWS from 'aws-sdk';
import { getEnv } from 'erxes-api-shared/utils';
import * as nodemailer from 'nodemailer';
import { IModels } from '~/connectionResolvers';
import { ISESConfig } from '~/modules/organization/settings/db/definitions/configs';

let broadcasTransporter: nodemailer.Transporter;

const getAwsConfig = async (models: IModels) => {
  const config: ISESConfig = await models.EngageMessages.broadcastConfigs();

  if (config && config.accessKeyId && config.secretAccessKey && config.region) {
    return config;
  }

  const VERSION = getEnv({ name: 'VERSION', defaultValue: '' });

  if (VERSION === 'saas') {
    return {
      accessKeyId: getEnv({ name: 'AWS_SES_ACCESS_KEY_ID' }),
      secretAccessKey: getEnv({ name: 'AWS_SES_SECRET_ACCESS_KEY' }),
      region: getEnv({ name: 'AWS_REGION' }),
    };
  }

  return config;
};

export const createTransporter = async (models: IModels) => {
  if (broadcasTransporter) {
    return broadcasTransporter;
  }

  const config = await getAwsConfig(models);

  try {
    AWS.config.update(config);

    broadcasTransporter = nodemailer.createTransport({
      SES: new AWS.SES({ apiVersion: '2010-12-01' }),
    });

    return broadcasTransporter;
  } catch (error) {
    console.log(`Error during create transporter: ${error.message}`);
    throw new Error(error.message);
  }
};
