import * as request from 'request';
import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../connectionResolver';
// import { generateAttachmentUrl } from '@erxes/api-utils/src/core';

const mutations = {
  async zerocodeaiSaveConfig(_root, args: any, { models }: IContext) {
    const prev = await models.Configs.findOne();

    if (!prev) {
      await models.Configs.create(args);
    } else {
      await models.Configs.update({}, { $set: args });
    }

    const config = await models.Configs.findOne({});

    if (!config?.projectId) {
      const response: {
        status: string;
        project_id: string;
        token: string;
      } = await new Promise((resolve, reject) => {
        request(
          {
            method: 'POST',
            url: 'https://zero-ai.com/bot/project/create',
            formData: {
              api_key: config?.apiKey || '',
              name: config?.projectName || ''
            }
          },
          (error, response) => {
            if (error) {
              return reject(error);
            }

            return resolve(JSON.parse(response.body));
          }
        );
      });

      await models.Configs.update(
        {},
        { $set: { projectId: response.project_id, token: response.token } }
      );
    }

    return config;
  },

  async zerocodeaiTrain(_root, { file }, { models }: IContext) {
    const config = await models.Configs.findOne({});

    if (!config || !config.projectId) {
      throw new Error('Config not found');
    }

    const response = await new Promise((resolve, reject) => {
      request(
        {
          method: 'POST',
          url: 'https://zero-ai.com/bot/dataset/update',
          formData: {
            api_key: config.apiKey,
            id: config.projectId,
            upload_file:
              'https://demo-erxes.s3.amazonaws.com/0.013081930923371843datad-customer-import-template.csv' // generateAttachmentUrl(file)
          }
        },
        (error, response) => {
          if (error) {
            return reject(error);
          }

          return resolve(JSON.parse(response.body));
        }
      );
    });

    return response;
  }
};

moduleRequireLogin(mutations);

export default mutations;
