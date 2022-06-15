import mutations from '../../../graphql/mutations';
import { IContext } from '../../types';
import { sendGraphQLRequest } from '../../../utils';

const erxesMutations = {
  erxesMutation(
    _root,
    {
      name,
      variables
    }: { name: string; variables?: { [key: string]: string } },
    { user }: IContext
  ) {
    return sendGraphQLRequest({
      query: mutations[name],
      name,
      variables: {
        ...variables,
        customerId: user.erxesCustomerId,
        companyId: user.erxesCompanyId
      }
    });
  }
};

export default erxesMutations;
