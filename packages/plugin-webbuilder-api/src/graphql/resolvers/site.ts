import { IContext } from '../../connectionResolver';
import { ISiteDocument } from '../../models/definitions/sites';
import { readHelpersData } from './utils';

export default {
  async templateImage(site: ISiteDocument, _args, { models }: IContext) {
    const template = await readHelpersData(
      'template',
      `templateId=${site.templateId}`
    );

    return template && template.image;
  }
};
