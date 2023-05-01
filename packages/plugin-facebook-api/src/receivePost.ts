import { IModels } from './connectionResolver';
import { INTEGRATION_KINDS } from './constants';
import { getOrCreateCustomer, getOrCreatePost } from './store';
import { IPostParams } from './types';

const receivePost = async (
  models: IModels,
  subdomain: string,
  params: IPostParams,
  pageId: string
) => {
  const integration = await models.Integrations.findOne({
    $and: [
      { facebookPageIds: { $in: pageId } },
      { kind: INTEGRATION_KINDS.POST }
    ]
  });

  if (!integration) {
    throw new Error('Integration not found');
  }

  const userId = params.from.id;

  const customer = await getOrCreateCustomer(
    models,
    subdomain,
    pageId,
    userId,
    INTEGRATION_KINDS.POST
  );

  await getOrCreatePost(
    models,
    subdomain,
    params,
    pageId,
    userId,
    customer.erxesApiId || ''
  );
};

export default receivePost;
