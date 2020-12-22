import { currentUser as currentUserQuery } from 'erxes-ui/lib/auth/graphql';

const currentUser = currentUserQuery;
export default { currentUser };
