import { generateUsersCards } from './utils';

const aputpmQueries = {
  async getCreatedUsersCards(_root, params, { subdomain }) {
    return await generateUsersCards({
      subdomain,
      params,
      fieldName: 'userId'
    });
  },
  async getAssignedUsersCards(_root, params, { subdomain }) {
    return await generateUsersCards({
      subdomain,
      params,
      fieldName: 'assignedUserIds'
    });
  },
  async getCustomFieldUsersCards(_root, params, { subdomain }) {
    return await generateUsersCards({
      subdomain,
      params,
      fieldName: 'customFieldsData.value'
    });
  }
};

export default aputpmQueries;
