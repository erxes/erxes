import { ResponseTemplates } from '../../../db/models';
import { IResponseTemplate } from '../../../db/models/definitions/responseTemplates';
import { moduleRequireLogin } from '../../permissions';

interface IResponseTemplatesEdit extends IResponseTemplate {
  _id: string;
}

const responseTemplateMutations = {
  /**
   * Create new response template
   */
  responseTemplatesAdd(_root, doc: IResponseTemplate) {
    return ResponseTemplates.create(doc);
  },

  /**
   * Update response template
   */
  responseTemplatesEdit(_root, { _id, ...fields }: IResponseTemplatesEdit) {
    return ResponseTemplates.updateResponseTemplate(_id, fields);
  },

  /**
   * Delete response template
   */
  responseTemplatesRemove(_root, { _id }: { _id: string }) {
    return ResponseTemplates.removeResponseTemplate(_id);
  },
};

moduleRequireLogin(responseTemplateMutations);

export default responseTemplateMutations;
