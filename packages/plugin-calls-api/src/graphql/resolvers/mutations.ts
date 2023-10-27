import { Callss, Types, Integrations } from '../../models';
import { IContext } from '@erxes/api-utils/src/types';
import * as jwt from 'jsonwebtoken';
import { generateToken } from '../../utils';

const callsMutations = {
  /**
   * Creates a new calls
   */
  async callssAdd(_root, doc, _context: IContext) {
    return Callss.createCalls(doc);
  },
  /**
   * Edits a new calls
   */
  async callssEdit(_root, { _id, ...doc }, _context: IContext) {
    return Callss.updateCalls(_id, doc);
  },
  /**
   * Removes a single calls
   */
  async callssRemove(_root, { _id }, _context: IContext) {
    return Callss.removeCalls(_id);
  },

  /**
   * Creates a new type for calls
   */
  async callsTypesAdd(_root, doc, _context: IContext) {
    return Types.createType(doc);
  },

  async callsTypesRemove(_root, { _id }, _context: IContext) {
    return Types.removeType(_id);
  },

  async callsTypesEdit(_root, { _id, ...doc }, _context: IContext) {
    return Types.updateType(_id, doc);
  },

  async callsIntegrationUpdate(_root, { configs }, _context: IContext) {
    const { inboxId, username, password, ...data } = configs;

    const token = await generateToken(inboxId, username, password);

    const integration = await Integrations.findOneAndUpdate(
      { inboxId },
      { $set: { ...data, token, username, password } },
      {
        returnOriginal: false
      }
    );
    return integration;
  }
};

export default callsMutations;
