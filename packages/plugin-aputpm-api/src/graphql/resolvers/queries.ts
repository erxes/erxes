import { generateCreatedUsersCards } from './utils';

const aputpmQueries = {
  async getCreatedUsersCards(_root, params, { subdomain }) {
    return await generateCreatedUsersCards({ subdomain, params });
  }
};

export default aputpmQueries;
