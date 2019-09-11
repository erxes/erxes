import { Integrations } from '../models';
import { getOrCreateCustomer, getOrCreatePost } from './store';
import { IPostParams } from './types';

const receivePost = async (params: IPostParams, pageId: string) => {
  const integration = await Integrations.findOne({
    $and: [{ facebookPageIds: { $in: pageId } }, { kind: 'facebook-post' }],
  });

  if (!integration) {
    return;
  }

  const userId = params.from.id;

  const customer = await getOrCreateCustomer(pageId, userId);

  await getOrCreatePost(params, pageId, userId, customer.erxesApiId);
};

export default receivePost;
