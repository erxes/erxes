import { Brands } from "../../apiCollections";
import { IResponseTemplateDocument } from "../../models/definitions/responseTemplates";

export default {
  brand(responseTemplate: IResponseTemplateDocument) {
    return Brands.findOne({ _id: responseTemplate.brandId });
  }
};
