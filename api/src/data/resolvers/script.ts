import { Integrations, KnowledgeBaseTopics } from '../../db/models';
import { IScriptDocument } from '../../db/models/definitions/scripts';

export default {
  messenger(script: IScriptDocument) {
    return Integrations.getIntegration({ _id: script.messengerId });
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
