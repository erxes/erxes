import { generateModels } from './connectionResolver';
import { checkBlock } from './models/utils/blockUtils';

const allowTypes = {
  'savings:transaction': ['create'],
};

export const afterMutationHandlers = async (subdomain, params) => {
  const { type, action } = params;

  const models = await generateModels(subdomain);

  if (!Object.keys(allowTypes).includes(type)) {
    return;
  }

  if (!allowTypes[type].includes(action)) {
    return;
  }

  let response: any;

  try {
    switch (type) {
      case 'savings:transaction':
        response = await checkBlock(models,subdomain, params.object);
        break;
    }
  } catch (e) {
   
  }
};

export default allowTypes;
