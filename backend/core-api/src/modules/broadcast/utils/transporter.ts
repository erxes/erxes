import * as AWS from 'aws-sdk';
import * as nodemailer from 'nodemailer';
import { IModels } from '~/connectionResolvers';
import { ISESConfig } from '~/modules/organization/settings/db/definitions/configs';

let broadcasTransporter: nodemailer.Transporter;

export const createTransporter = async (models: IModels) => {
  if (broadcasTransporter) {
    return broadcasTransporter;
  }

  const config: ISESConfig = await models.EngageMessages.broadcastConfigs();

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
