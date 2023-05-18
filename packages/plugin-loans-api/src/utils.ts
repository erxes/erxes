import * as _ from 'underscore';

const gatherContractFieldNames = async (_models, _doc, prevList = null) => {
  let options = [];

  if (prevList) {
    options = prevList;
  }

  return options;
};

interface IParams {
  action?: string;
  type: string;
  object: any;
  extraParams: any;
}

export const gatherDescriptions = async (params: IParams) => {
  const { action, object, type, extraParams } = params;
  const { models } = extraParams;

  let extraDesc = [];
  let description = '';

  switch (type) {
    case 'contract': {
      description = `${object.number} has been ${action}d`;

      extraDesc = await gatherContractFieldNames(models, object);
      break;
    }

    case 'collateral': {
      description = `${object.code} has been ${action}d`;

      extraDesc = await gatherContractFieldNames(models, object);
      break;
    }
    default:
      break;
  }
  return { extraDesc, description };
};
