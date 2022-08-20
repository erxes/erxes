import * as _ from 'underscore';

const gatherContractFieldNames = async (_models, _doc, prevList = null) => {
  let options = [];

  if (prevList) {
    options = prevList;
  }

  return options;
};

export const gatherDescriptions = async params => {
  const { action, obj, type, extraParams } = params;
  const { models } = extraParams;

  let extraDesc = [];
  let description = '';

  switch (type) {
    case 'contract': {
      description = `${obj.number} has been ${action}d`;

      extraDesc = await gatherContractFieldNames(models, obj);
      break;
    }

    case 'collateral': {
      description = `${obj.code} has been ${action}d`;

      extraDesc = await gatherContractFieldNames(models, obj);
      break;
    }
    default:
      break;
  }
  return { extraDesc, description };
};
