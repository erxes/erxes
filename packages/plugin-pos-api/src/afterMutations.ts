import { sendPosclientMessage } from './messageBroker';

const handler = async (
  subdomain,
  params: any,
  action: string,
  type: string
) => {
  // TODO: check filter
  await sendPosclientMessage({
    subdomain,
    action: 'crudData',
    data: { ...params, action, type }
  });
};

export default {
  'core:user': ['update', 'delete'],
  'products:productCategory': ['create', 'update', 'delete'],
  'products:product': ['create', 'update', 'delete']
};

export const afterMutationHandlers = async (subdomain, params) => {
  const { type, action, user } = params;

  if (type === 'products:product') {
    await handler(subdomain, params, action, 'product');
    return;
  }
  if (type === 'products:productCategory') {
    await handler(subdomain, params, action, 'productCategory');
    return;
  }
  if (type === 'core:users') {
    await handler(subdomain, params, action, 'user');
    return;
  }
};
