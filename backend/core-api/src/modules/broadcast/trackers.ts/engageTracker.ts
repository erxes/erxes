import AWS from 'aws-sdk';

import { IModels } from '~/connectionResolvers';
import { ISESConfig } from '../@types/types';

export const getApi = async (models: IModels, type: string): Promise<any> => {
  const config: ISESConfig = await models.Configs.getSESConfigs();
  if (!config) {
    return;
  }

  AWS.config.update(config);

  if (type === 'ses') {
    return new AWS.SES();
  }

  return new AWS.SNS();
};

export const awsRequests = {
  async getVerifiedEmails(models: IModels) {
    const api = await getApi(models, 'ses');

    return new Promise((resolve, reject) => {
      api.listVerifiedEmailAddresses((error, data) => {
        if (error) {
          return reject(error);
        }

        return resolve(data.VerifiedEmailAddresses);
      });
    });
  },

  async verifyEmail(models: IModels, email: string) {
    const api = await getApi(models, 'ses');

    return new Promise((resolve, reject) => {
      api.verifyEmailAddress({ EmailAddress: email }, (error, data) => {
        if (error) {
          return reject(error);
        }

        return resolve(data);
      });
    });
  },

  async removeVerifiedEmail(models: IModels, email: string) {
    const api = await getApi(models, 'ses');

    return new Promise((resolve, reject) => {
      api.deleteVerifiedEmailAddress({ EmailAddress: email }, (error, data) => {
        if (error) {
          return reject(error);
        }

        return resolve(data);
      });
    });
  },
};
