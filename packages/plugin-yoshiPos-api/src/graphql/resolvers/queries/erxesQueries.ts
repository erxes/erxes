import { sendGraphQLRequest } from '../../utils';
import queries from '../../queries';

const erxesQueries = {
  erxesQuery(
    _root,
    { name, variables }: { name: string; variables?: { [key: string]: string } }
  ) {
    return sendGraphQLRequest({
      query: queries[name],
      name,
      variables
    });
  }
};

export default erxesQueries;
