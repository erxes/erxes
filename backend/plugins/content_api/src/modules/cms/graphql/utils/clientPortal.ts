import { IContext } from '~/connectionResolvers';

export const requireClientPortalId = (context: IContext): string => {
  const clientPortalId = context.clientPortal?._id;

  if (!clientPortalId) {
    throw new Error('Client portal is required');
  }

  return clientPortalId;
};

export const getClientPortalUserId = (context: IContext): string | undefined =>
  context.cpUser?._id || context.user?._id;

export const assertOwnedDocument = async (
  model: any,
  _id: string,
  clientPortalId: string,
  errorMessage: string,
) => {
  const document = await model.findOne({ _id, clientPortalId }).lean();

  if (!document) {
    throw new Error(errorMessage);
  }

  return document;
};

export const assertOwnedDocuments = async (
  model: any,
  _ids: string[],
  clientPortalId: string,
  errorMessage: string,
) => {
  const documents = await model
    .find({ _id: { $in: _ids }, clientPortalId })
    .select({ _id: 1 })
    .lean();

  if (documents.length !== _ids.length) {
    throw new Error(errorMessage);
  }

  return documents;
};
