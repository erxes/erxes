import { IContext } from '../../connectionResolver';
import { IScriptDocument } from '../../models/definitions/scripts';

export default {
  messenger(script: IScriptDocument, _args, { models }: IContext) {
    return models.Integrations.findOne({ _id: script.messengerId });
  },

  kbTopic(script: IScriptDocument) {
    if(!script.kbTopicId) {
      return; 
    }

    return {
      __typename: "KnowledgeBaseTopic",
      _id: script.kbTopicId
    }
  },

  leads(script: IScriptDocument, _args, { models }: IContext) {
    return models.Integrations.findIntegrations({
      _id: { $in: script.leadIds || [] }
    });
  }
};
