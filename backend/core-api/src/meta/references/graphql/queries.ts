import {
  getRecordReferenceFields,
  resolveRecordReferencePlaceholders,
} from 'erxes-api-shared/core-modules';
import { IContext } from '~/connectionResolvers';

type TRecordReferenceResolvePlaceholdersArgs = {
  targetType: string;
  targetId?: string;
  value: unknown;
  fallback?: unknown;
  alias?: string;
};

type TRecordReferenceFieldsArgs = {
  type: string;
};

export const referenceQueries = {
  recordReferenceFields: async (
    _root: undefined,
    { type }: TRecordReferenceFieldsArgs,
    { models }: IContext,
  ) => getRecordReferenceFields({ models, type }),

  recordReferenceResolvePlaceholders: async (
    _root: undefined,
    {
      alias,
      fallback,
      targetId,
      targetType,
      value,
    }: TRecordReferenceResolvePlaceholdersArgs,
    { subdomain }: IContext,
  ) =>
    resolveRecordReferencePlaceholders({
      alias,
      fallback,
      subdomain,
      targetId,
      targetType,
      value,
    }),
};
