import { Integrations, KnowledgeBaseTopics } from '../../db/models';
import { IScriptDocument } from '../../db/models/definitions/scripts';
import { getDocument } from './mutations/cacheUtils';

export default {
  messenger(script: IScriptDocument) {
    if (script.messengerId) {
      return getDocument('integrations', { _id: script.messengerId });
    }

    return null;
  },

  kbTopic(script: IScriptDocument) {
    return KnowledgeBaseTopics.findOne({ _id: script.kbTopicId });
  },

  leads(script: IScriptDocument) {
    return Integrations.findIntegrations({
      _id: { $in: script.leadIds || [] }
    });
  }
};
