import { customerToDynamic } from './utils';

const allowTypes = {
  'contacts:customer': ['create'],
  'contacts:company': ['create']
};

export const afterMutationHandlers = async (subdomain, params) => {
  const { type, action } = params;

  if (!Object.keys(allowTypes).includes(type)) {
    return;
  }

  if (!allowTypes[type].includes(action)) {
    return;
  }

  try {
    if (type === 'contacts:customer') {
      if (action === 'create') {
        customerToDynamic(subdomain, params.object);
        return;
      }
    }

    if (type === 'contacts:company') {
      if (action === 'create') {
        customerToDynamic(subdomain, params.object);
        return;
      }
    }
  } catch (e) {
    console.log(e, 'error');
  }
};

export default allowTypes;
