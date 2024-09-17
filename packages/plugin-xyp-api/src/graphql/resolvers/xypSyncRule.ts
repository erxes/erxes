import { IContext } from '../../connectionResolver';
import { sendCommonMessage, sendFormsMessage } from '../../messageBroker';
import { customFieldsDataByFieldCode } from '@erxes/api-utils/src/fieldUtils';
import { ISyncRuleDocument } from '../../models/definitions/syncRule';

export default {
  async fieldGroupObj(syncRule: ISyncRuleDocument, _, { subdomain }: IContext) {
    if (!syncRule.fieldGroup) {
      return;
    }
    return await sendFormsMessage({
      subdomain,
      action: 'fieldsGroups.findOne',
      data: {query: {_id: syncRule.fieldGroup}},
      isRPC: true,
      defaultValue: {}
    });
  },

  async formFieldObj(syncRule: ISyncRuleDocument, _, { subdomain }: IContext) {
    if (!syncRule.formField) {
      return;
    }
    return await sendFormsMessage({
      subdomain,
      action: 'fields.findOne',
      data: {query: {_id: syncRule.formField}},
      isRPC: true,
      defaultValue: {}
    });
  }
};
