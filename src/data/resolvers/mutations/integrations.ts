import { Integrations } from '../../../db/models';
import { IIntegration, IMessengerData, IUiOptions } from '../../../db/models/definitions/integrations';
import { IExternalIntegrationParams, IMessengerIntegration } from '../../../db/models/Integrations';
import { checkPermission } from '../../permissions';
import { fetchIntegrationApi } from '../../utils';

interface IEditMessengerIntegration extends IMessengerIntegration {
  _id: string;
}

interface IEditFormIntegration extends IIntegration {
  _id: string;
}

const integrationMutations = {
  /**
   * Create a new messenger integration
   */
  integrationsCreateMessengerIntegration(_root, doc: IMessengerIntegration) {
    return Integrations.createMessengerIntegration(doc);
  },

  /**
   * Update messenger integration
   */
  integrationsEditMessengerIntegration(_root, { _id, ...fields }: IEditMessengerIntegration) {
    return Integrations.updateMessengerIntegration(_id, fields);
  },

  /**
   * Update/save messenger appearance data
   */
  integrationsSaveMessengerAppearanceData(_root, { _id, uiOptions }: { _id: string; uiOptions: IUiOptions }) {
    return Integrations.saveMessengerAppearanceData(_id, uiOptions);
  },

  /**
   * Update/save messenger data
   */
  integrationsSaveMessengerConfigs(_root, { _id, messengerData }: { _id: string; messengerData: IMessengerData }) {
    return Integrations.saveMessengerConfigs(_id, messengerData);
  },

  /**
   * Create a new messenger integration
   */
  integrationsCreateFormIntegration(_root, doc: IIntegration) {
    return Integrations.createFormIntegration(doc);
  },

  /**
   * Edit a form integration
   */
  integrationsEditFormIntegration(_root, { _id, ...doc }: IEditFormIntegration) {
    return Integrations.updateFormIntegration(_id, doc);
  },

  /*
   * Create external integrations like twitter, facebook, gmail etc ...
   */
  async integrationsCreateExternalIntegration(_root, { data, ...doc }: IExternalIntegrationParams & { data: object }) {
    const integration = await Integrations.createExternalIntegration(doc);

    await fetchIntegrationApi({
      path: '/integrations/create',
      method: 'POST',
      body: {
        accountId: doc.accountId,
        integrationId: integration._id,
        kind: doc.kind,
        data: data ? JSON.stringify(data) : '',
      },
    });

    return integration;
  },

  /**
   * Delete an integration
   */
  async integrationsRemove(_root, { _id }: { _id: string }) {
    await fetchIntegrationApi({
      path: '/integrations/remove',
      method: 'POST',
      body: {
        integrationId: _id,
      },
    });

    return Integrations.removeIntegration(_id);
  },

  /**
   * Delete an account
   */
  async integrationsRemoveAccount(_root, { _id }: { _id: string }) {
    return fetchIntegrationApi({ path: '/accounts/remove', method: 'post', body: { _id } });
  },
};

checkPermission(
  integrationMutations,
  'integrationsCreateMessengerIntegration',
  'integrationsCreateMessengerIntegration',
);
checkPermission(
  integrationMutations,
  'integrationsSaveMessengerAppearanceData',
  'integrationsSaveMessengerAppearanceData',
);
checkPermission(integrationMutations, 'integrationsSaveMessengerConfigs', 'integrationsSaveMessengerConfigs');
checkPermission(integrationMutations, 'integrationsCreateFormIntegration', 'integrationsCreateFormIntegration');
checkPermission(integrationMutations, 'integrationsEditFormIntegration', 'integrationsEditFormIntegration');
checkPermission(integrationMutations, 'integrationsRemove', 'integrationsRemove');

export default integrationMutations;
