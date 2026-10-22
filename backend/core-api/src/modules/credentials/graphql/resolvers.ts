import { GraphQLError } from 'graphql';
import type { IContext } from '~/connectionResolvers';
import { authenticateCredentialManager } from '../auth';
import type { CredentialPermission } from '../access';
import { auditCredentialEvent } from '../audit';
import { createCredentialsService } from '../service';
import { createCredentialStore } from '../store';
import { CredentialsError } from '../types';
import type { CredentialInput } from '../types';

type CredentialsService = ReturnType<typeof createCredentialsService>;

const managementResolver = <Args, Result>(
  permission: CredentialPermission,
  operation: (service: CredentialsService, args: Args) => Result | Promise<Result>,
) => async (_root: unknown, args: Args, context: IContext): Promise<Result> => {
  context.res.setHeader('Cache-Control', 'no-store');
  context.res.setHeader('Pragma', 'no-cache');
  try {
    const user = await authenticateCredentialManager(context, permission);
    const store = createCredentialStore(context.models, context.subdomain);
    const service = createCredentialsService(store, context.subdomain, (action, metadata) =>
      auditCredentialEvent(context.subdomain, action, metadata, user._id));
    return await operation(service, args);
  } catch (error: unknown) {
    const safe = error instanceof CredentialsError ? error : new CredentialsError();
    // No originalError/cause: database/JWT/validation errors may contain inputs.
    throw new GraphQLError(safe.message, { extensions: { code: safe.code } });
  }
};

export const credentialsQueries = {
  credentialsTemplates: managementResolver('credentialsRead', (service) => service.templates()),
  credentialsList: managementResolver('credentialsRead', (service, args: { search?: string; category?: string }) =>
    service.list(args.search, args.category)),
  credentialsDetail: managementResolver('credentialsRead', (service, args: { _id: string }) => service.detail(args._id)),
  credentialsGrants: managementResolver('credentialsRead', (service, args: { credentialId: string }) => service.grants(args.credentialId)),
};

export const credentialsMutations = {
  credentialsCreate: managementResolver('credentialsManage', (service, args: { input: CredentialInput }) => service.create(args.input)),
  credentialsUpdate: managementResolver('credentialsManage', (service, args: { _id: string; input: CredentialInput }) => service.update(args._id, args.input)),
  credentialsDelete: managementResolver('credentialsManage', (service, args: { _id: string }) => service.remove(args._id)),
  credentialsGrantCreate: managementResolver('credentialGrantsManage', (service, args: { credentialId: string; pluginName: string; name: string }) =>
    service.issueGrant(args.credentialId, args.pluginName, args.name)),
  credentialsGrantRevoke: managementResolver('credentialGrantsManage', (service, args: { _id: string }) => service.revokeGrant(args._id)),
};
