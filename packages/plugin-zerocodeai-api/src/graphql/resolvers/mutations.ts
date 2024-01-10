import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../connectionResolver';
import fetch from 'node-fetch';
import FormData from 'form-data';
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
      const body = new FormData();
      body.append('api_key', config?.apiKey || '');
      body.append('name', config?.projectName || '');

      const req = await fetch('https://zero-ai.com/bot/project/create', {
        method: 'POST',
        body
      });
      const response = await req.json();

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

    const body = new FormData();
    body.append('api_key', config.apiKey);
    body.append('id', config.projectId);
    body.append(
      'upload_file',
      'https://demo-erxes.s3.amazonaws.com/0.013081930923371843datad-customer-import-template.csv'
    ); // generateAttachmentUrl(file)
    const req = await fetch('https://zero-ai.com/bot/dataset/update', {
      method: 'POST',
      body
    });
    return req.json();
  }
};

moduleRequireLogin(mutations);

export default mutations;
