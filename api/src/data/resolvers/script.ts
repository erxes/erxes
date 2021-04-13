import { KnowledgeBaseTopics } from '../../db/models';
import { IScriptDocument } from '../../db/models/definitions/scripts';
import { getDocument, getDocumentList } from './mutations/cacheUtils';

export default {
  messenger(script: IScriptDocument) {
    return getDocument('integrations', { _id: script.messengerId });
  },

  kbTopic(script: IScriptDocument) {
    return KnowledgeBaseTopics.findOne({ _id: script.kbTopicId });
  },

  leads(script: IScriptDocument) {
    return getDocumentList('integrations', {
      _id: { $in: script.leadIds || [] },
      isActive: { $ne: false }
    });
  }
};
