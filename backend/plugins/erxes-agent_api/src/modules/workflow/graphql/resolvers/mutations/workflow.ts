import { IContext } from '~/connectionResolvers';
import { validateDefinition } from '~/mastra/workflows/dsl';
import { buildManualEnvelope } from '~/mastra/workflows/envelope';
import { runWorkflow } from '~/mastra/workflows/runtime';
import { getOperationRegistry } from '~/mastra/tools/operationRegistry';
import { runWithAuth } from '~/mastra/requestContext';

const requireUserId = (user: any): string => {
  const userId = user?._id;
  if (!userId) throw new Error('Login required');
  return userId;
};

// Save-time validation runs with the LIVE operation registry, so a definition
// referencing a nonexistent or out-of-policy operation never reaches Mongo.
const validateWithRegistry = async (models: any, definition: any) => {
  const settings = await models.MastraSettings.getSettings();
  const registry = await getOperationRegistry(settings);
  const result = validateDefinition(definition, registry);
  if (!result.ok) {
    const lines = result.errors
      .map((e) => `${e.path}: ${e.message}`)
      .join('\n');
    throw new Error(`Workflow definition is invalid:\n${lines}`);
  }
};

export const workflowMutations = {
  mastraWorkflowCreate: async (
    _: any,
    { doc }: any,
    { models, user }: IContext,
  ) => {
    const userId = requireUserId(user);
    await validateWithRegistry(models, doc.definition);
    return models.MastraWorkflow.createWorkflow({
      ...doc,
      createdByUserId: userId,
    });
  },

  mastraWorkflowUpdate: async (
    _: any,
    { _id, doc }: any,
    { models, user }: IContext,
  ) => {
    requireUserId(user);
    if (doc.definition) await validateWithRegistry(models, doc.definition);
    return models.MastraWorkflow.updateWorkflow(_id, doc);
  },

  mastraWorkflowRemove: async (
    _: any,
    { _id }: { _id: string },
    { models, user }: IContext,
  ) => {
    requireUserId(user);
    return models.MastraWorkflow.removeWorkflow(_id);
  },

  mastraWorkflowSetEnabled: async (
    _: any,
    { _id, isEnabled }: { _id: string; isEnabled: boolean },
    { models, user }: IContext,
  ) => {
    requireUserId(user);
    return models.MastraWorkflow.setEnabled(_id, isEnabled);
  },

  // Dry validation for the master agent's draft loop — returns structured
  // errors instead of throwing, so the model can iterate.
  mastraWorkflowValidate: async (
    _: any,
    { definition }: any,
    { models, user }: IContext,
  ) => {
    requireUserId(user);
    const settings = await models.MastraSettings.getSettings();
    const registry = await getOperationRegistry(settings);
    const result = validateDefinition(definition, registry);
    return { ok: result.ok, errors: result.errors };
  },

  // Manual trigger. Allowed even when the workflow is disabled — disabling
  // gates event triggers, not deliberate test runs.
  mastraWorkflowRunStart: async (
    _: any,
    { _id, input }: { _id: string; input?: Record<string, any> },
    { models, subdomain, user }: IContext,
  ) => {
    const userId = requireUserId(user);
    const workflow = await models.MastraWorkflow.getWorkflow(_id);
    const envelope = buildManualEnvelope(input || {}, userId);
    // Operation steps execute AS the requesting user (erxes enforces their
    // permissions), not as the privileged app token — that fallback is
    // reserved for background (schedule/automation) runs.
    return runWithAuth(
      {
        userHeader: Buffer.from(JSON.stringify(user)).toString('base64'),
        subdomain,
      },
      () => runWorkflow({ models, subdomain, workflow, envelope }),
    );
  },
};
