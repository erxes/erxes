import { IResponseTemplateDocument } from '../../db/models/definitions/responseTemplates';
import { getDocument } from './mutations/cacheUtils';

export default {
  brand(responseTemplate: IResponseTemplateDocument) {
    return getDocument('brands', { _id: responseTemplate.brandId });
  }
};
