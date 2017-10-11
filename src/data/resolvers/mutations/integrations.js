import { Integrations } from '../../../db/models';

export default {
  /**
   * Create a new messenger integration
   * @param {Object}
   * @param {String} doc.title
   * @param {String} doc.brandId
   * @return {Promise} returns the messenger integration
   * @throws {Error} apollo level error based on validation
   * @throws {Error} throws error if user is not logged in
   */
  integrationsCreateMessengerIntegration(root, doc, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    return Integrations.createMessengerIntegration(doc);
  },

  /**
   * Edit a messenger integration
   * @param {Object}
   * @param {String} args.id
   * @param {String} args.title
   * @param {String} args.brandId
   * @return {Promise} returns null
   * @throws {Error} apollo level error based on validation
   * @throws {Error} throws error if user is not logged in
   */
  integrationsEditMessengerIntegration(root, { id, ...fields }, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    return Integrations.updateMessengerIntegration(id, fields);
  },

  /**
   * Edit/save messenger appearance data
   * @param {Object}
   * @param {String} args.id
   * @param {String} args.color
   * @param {String} args.wallpaper
   * @param {String} args.logo
   * @return {Promise} returns null
   * @throws {Error} apollo level error based on validation
   * @throws {Error} throws error if user is not logged in
   */
  integrationsSaveMessengerAppearanceData(root, { id, uiOptions }, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    return Integrations.saveMessengerAppearanceData(id, uiOptions);
  },

  /**
   * Edit/save messenger data
   * @param {Object}
   * @param {String} args.id
   * @param {Boolean} args.notifyCustomer
   * @param {String} args.availabilityMethod
   * @param {Boolean} args.isOnline
   * @param {String} args.onlineHours.day
   * @param {String} args.onlineHours.from
   * @param {String} args.onlineHours.to
   * @param {String} args.timezone
   * @param {String} args.welcomeMessage
   * @param {String} args.awayMessage
   * @param {String} args.thankYouMessage
   * @return {Promise} returns null
   * @throws {Error} apollo level error based on validation
   * @throws {Error} throws error if user is not logged in
   */
  integrationsSaveMessengerConfigs(root, { id, messengerData }, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    return Integrations.saveMessengerConfigs(id, messengerData);
  },

  /**
   * Create a new messenger integration
   * @param {Object}
   * @param {String} doc.title
   * @param {String} doc.brandId
   * @param {String} doc.formId
   * @param {Object} doc.formData
   * @return {Promise} returns the messenger integration
   * @throws {Error} apollo level error based on validation
   * @throws {Error} throws error if user is not logged in
   */
  integrationsCreateFormIntegration(root, doc, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    return Integrations.createFormIntegration(doc);
  },

  /**
   * Edit a form integration
   * @param {Object}
   * @param {String} doc.title
   * @param {String} doc.brandId
   * @param {String} doc.formId
   * @param {Object} doc.formData
   * @return {Promise} returns null
   * @throws {Error} apollo level error based on validation
   * @throws {Error} throws error if user is not logged in
   */
  integrationsEditFormIntegration(root, { id, ...doc }, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    return Integrations.updateFormIntegration(id, doc);
  },

  /**
  * Delete an integration
   * @param {Object}
   * @param {String} args.id
   * @return {Promise} returns the messenger integration
   * @throws {Error} apollo level error based on validation
   * @throws {Error} throws error if user is not logged in
   */
  integrationsRemove(root, { id }, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    return Integrations.removeIntegration({ _id: id });
  },
};
