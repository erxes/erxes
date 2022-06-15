import { sendGraphQLRequest } from '../../../utils';
import { Configs } from '../../../models/Configs';

const configQueries = {
  currentConfig() {
    return Configs.findOne();
  },

  async getBranches(_root, _param) {
    const config = await Configs.findOne({}).lean();
    return sendGraphQLRequest({
      query: `
        query ecommerceGetBranches($posToken: String) {
          ecommerceGetBranches(posToken: $posToken) {
            _id
            title
            parentId
            supervisorId
            code
            userIds
            address
            phoneNumber
            email
            links
            coordinate {
              longitude
              latitude
            }
            image {
              url
              name
              type
              size
            }
          }
        }
      `,
      name: 'ecommerceGetBranches',
      variables: { posToken: config.token || '' }
    });
  }
};

export default configQueries;
