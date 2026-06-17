import { TRecordReferencesConfig } from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';

const joinNames = (...names: Array<string | undefined>) =>
  names.filter(Boolean).join(' ');

export const coreReferenceCustomResolvers: TRecordReferencesConfig<IModels>['resolvers'] =
  {
    customerFullName: ({ target }) =>
      joinNames(target.firstName, target.middleName, target.lastName),

    customerDisplayName: ({ target }) =>
      joinNames(target.firstName, target.middleName, target.lastName) ||
      target.primaryEmail ||
      target.primaryPhone ||
      target.code ||
      target._id,
  };
