import * as request from 'request';
import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../connectionResolver';

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
  }
};

moduleRequireLogin(mutations);

export default mutations;
