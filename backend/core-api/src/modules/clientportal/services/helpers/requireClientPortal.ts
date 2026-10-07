import { IClientPortal, IClientPortalDocument } from '@/clientportal/types/clientPortal';
import { IModels } from '~/connectionResolvers';
import { ExpectedError } from 'erxes-api-shared/utils';

export async function requireClientPortal(
  models: IModels,
  clientPortal: IClientPortalDocument | null | undefined,
): Promise<IClientPortalDocument> {
  if (!clientPortal?._id) {
    throw new ExpectedError('Client portal required', 'UNAUTHORIZED');
  }

  const document = await models.ClientPortal.findOne({
    _id: clientPortal._id,
  });

  if (!document) {
    throw new ExpectedError('Client portal not found', 'UNAUTHORIZED');
  }

  return document;
}
