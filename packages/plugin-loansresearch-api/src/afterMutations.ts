import { generateModels } from './connectionResolver';
import { salaryToResearch, scoreToResearch } from './utils';

const allowTypes = {
  'xyp:xyp': ['create'],
  'burenscoring:burenscoring': ['create'],
};

export const afterMutationHandlers = async (subdomain, params) => {
  const { type, action, object } = params;

  if (!Object.keys(allowTypes).includes(type)) {
    return;
  }

  if (!allowTypes[type].includes(action)) {
    return;
  }

  const models = await generateModels(subdomain);

  try {
    if (type === 'xyp:xyp' && action === 'create') {
      await salaryToResearch(
        object,
        object.customerId || object.contentTypeId,
        models
      );

      return;
    }

    if (type === 'burenscoring:burenscoring' && action === 'create') {
      await scoreToResearch(
        object,
        object.customerId || object.contentTypeId,
        models
      );

      return;
    }
  } catch (e) {
    console.log(e.message);
  }
};

export default allowTypes;
