import { calculateFileDir, cfRecordUrl, toCamelCase } from '../utils';

/**
 * Finds an existing CDR or creates a new one with optional record URL processing
 * @param {Object} models - Database models
 * @param {string} subdomain - Subdomain for the request
 * @param {Object} cdrParams - CDR parameters
 * @param {string} inboxId - Inbox integration ID
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Object>} CDR document
 */
export const findOrCreateCdr = async (
  models,
  subdomain,
  cdrParams,
  inboxId,
  conversationId,
) => {
  validateRequiredParams(cdrParams);

  const { AcctId: acctId } = cdrParams;
  const existingCdr = await findExistingCdr(models, acctId);

  if (existingCdr) {
    return await updateExistingCdr(models, existingCdr, conversationId);
  }

  const newCdr = await createNewCdr(models, cdrParams, inboxId, conversationId);
  await processRecordUrl(models, cdrParams, inboxId, subdomain, acctId);

  return newCdr;
};

/**
 * Validates required parameters
 * @param {Object} cdrParams - CDR parameters to validate
 * @throws {Error} If AcctId is missing
 */
const validateRequiredParams = (cdrParams) => {
  const { AcctId } = cdrParams;
  if (!AcctId) {
    throw new Error('AcctId is required');
  }
};

/**
 * Finds existing CDR by account ID
 * @param {Object} models - Database models
 * @param {string} acctId - Account ID
 * @returns {Promise<Object|null>} Existing CDR or null
 */
const findExistingCdr = async (models, acctId) => {
  return await models.Cdrs.findOne({ acctId });
};

/**
 * Updates existing CDR with new conversation ID if different
 * @param {Object} models - Database models
 * @param {Object} cdr - Existing CDR document
 * @param {string} conversationId - New conversation ID
 * @returns {Promise<Object>} Updated CDR
 */
const updateExistingCdr = async (models, cdr, conversationId) => {
  if (conversationId && cdr.conversationId !== conversationId) {
    await models.Cdrs.updateOne({ _id: cdr._id }, { $set: { conversationId } });
    cdr.conversationId = conversationId;
  }
  return cdr;
};

/**
 * Creates a new CDR document
 * @param {Object} models - Database models
 * @param {Object} cdrParams - CDR parameters
 * @param {string} inboxId - Inbox integration ID
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Object>} Newly created CDR
 */
const createNewCdr = async (models, cdrParams, inboxId, conversationId) => {
  const camelCaseParams = toCamelCase(cdrParams);
  const { AcctId: acctId, ...filteredParams } = camelCaseParams as any;

  return await models.Cdrs.create({
    acctId,
    ...filteredParams,
    inboxIntegrationId: inboxId,
    conversationId,
    createdAt: new Date(),
  });
};

/**
 * Processes record URL if conditions are met
 * @param {Object} models - Database models
 * @param {Object} cdrParams - CDR parameters
 * @param {string} inboxId - Inbox integration ID
 * @param {string} subdomain - Subdomain
 * @param {string} acctId - Account ID
 */
const processRecordUrl = async (
  models,
  cdrParams,
  inboxId,
  subdomain,
  acctId,
) => {
  const { recordfiles, lastapp, disposition } = cdrParams;

  if (!shouldProcessRecordUrl(recordfiles, disposition, lastapp)) {
    return;
  }

  try {
    const recordUrl = await generateRecordUrl(
      cdrParams,
      inboxId,
      models,
      subdomain,
    );

    if (recordUrl) {
      await updateCdrWithRecordUrl(models, acctId, recordUrl);
    }
  } catch (error) {
    // Log error but don't throw - record URL is not critical for CDR creation
    console.error('Failed to process record URL:', error);
  }
};

/**
 * Determines if record URL should be processed based on conditions
 * @param {string} recordfiles - Record files
 * @param {string} disposition - Call disposition
 * @param {string} lastapp - Last application
 * @returns {boolean} Whether to process record URL
 */
const shouldProcessRecordUrl = (recordfiles, disposition, lastapp) => {
  return (
    recordfiles &&
    disposition === 'ANSWERED' &&
    (lastapp === 'Dial' || lastapp === 'Queue')
  );
};

/**
 * Generates record URL from CDR parameters
 * @param {Object} cdrParams - CDR parameters
 * @param {string} inboxId - Inbox integration ID
 * @param {Object} models - Database models
 * @param {string} subdomain - Subdomain
 * @returns {Promise<string|null>} Generated record URL
 */
const generateRecordUrl = async (cdrParams, inboxId, models, subdomain) => {
  const fileDir = calculateFileDir(cdrParams);

  return await cfRecordUrl(
    {
      fileDir,
      recordfiles: cdrParams.recordfiles,
      inboxIntegrationId: inboxId,
      retryCount: 1,
    },
    {},
    models,
    subdomain,
  );
};

/**
 * Updates CDR with record URL
 * @param {Object} models - Database models
 * @param {string} acctId - Account ID
 * @param {string} recordUrl - Record URL to set
 */
const updateCdrWithRecordUrl = async (models, acctId, recordUrl) => {
  await models.Cdrs.updateOne({ acctId }, { $set: { recordUrl } });
};
