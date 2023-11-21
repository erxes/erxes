import { generateCreatedUsersCards } from './utils';

const aputpmQueries = {
  async getCreatedUsersCards(_root, params, { subdomain }) {
    return await generateCreatedUsersCards({
      subdomain,
      params,
      fieldName: 'userId'
    });
  },
  async getAssignedUsersCards(_root, params, { subdomain }) {
    return await generateCreatedUsersCards({
      subdomain,
      params,
      fieldName: 'assignedUserIds'
    });
  }
};

export default aputpmQueries;
