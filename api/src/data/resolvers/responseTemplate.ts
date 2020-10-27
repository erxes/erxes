import { Brands } from '../../db/models';
import { IResponseTemplateDocument } from '../../db/models/definitions/responseTemplates';

export default {
  brand(responseTemplate: IResponseTemplateDocument) {
    return Brands.findOne({ _id: responseTemplate.brandId });
  },
};
