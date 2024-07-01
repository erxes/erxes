import { IModels } from './connectionResolver';

const toCamelCase = (str: string) => {
  return str.replace(/[-_](.)/g, function (match, group) {
    return group.toUpperCase();
  });
};

export const buildFile = async (
  models: IModels,
  subdomain: string,
  _id: string
) => {
  const template = await models.Templates.findOne(
    { _id },
    { _id: -1, name: 1, contentType: 1, content: 1 }
  ).lean();

  if (!template) {
    throw new Error('Templates not found');
  }

  const stringified = JSON.stringify(template);

  return {
    name: `${toCamelCase(template.name)}`,
    response: stringified
  };
};
